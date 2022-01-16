// Logger.ts - Logging utility
// Copyright (C) 2021 MineNode
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published
// by the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import fs from "fs";
import path from "path";
import util from "util";

import szBin from "7zip-bin";
import chalk from "chalk";
import sz from "node-7z";

import { getRootDirectory } from "./DeployUtils";

export enum LogLevel {
  DEBUG,
  INFO,
  WARN,
  ERROR,
}

export const defaultColors: Readonly<Record<LogLevel, chalk.Chalk>> = Object.freeze({
  [LogLevel.DEBUG]: chalk.greenBright,
  [LogLevel.INFO]: chalk.grey,
  [LogLevel.WARN]: chalk.yellow,
  [LogLevel.ERROR]: chalk.red,
});

export interface LogEntry {
  level: LogLevel;
  message: string;
  args: unknown[];
  formatted: string;
  timestamp: Date;
  name: string;
}

export interface LogConsumerOptions {
  minLevel?: LogLevel;
}

export abstract class LogConsumer {
  protected minLevel: LogLevel;

  public constructor(options: LogConsumerOptions = {}) {
    this.minLevel = options.minLevel ?? LogLevel.INFO;
  }

  protected abstract log(entry: LogEntry): unknown;

  private _log(name: string, level: LogLevel, message: string, ...args: unknown[]): void {
    if (level < this.minLevel) {
      return;
    }

    const entry: LogEntry = {
      level,
      message,
      args,
      formatted: util.format(message, ...args),
      timestamp: new Date(),
      name,
    };

    this.log(entry);
  }
}

export interface StdoutConsumerOptions extends LogConsumerOptions {
  colors?: Record<LogLevel, chalk.Chalk>;
}

export class StdoutConsumer extends LogConsumer {
  protected colors: Record<LogLevel, chalk.Chalk>;

  public constructor(options: StdoutConsumerOptions = {}) {
    super(options);
    this.colors = options.colors ?? defaultColors;
  }

  protected override log(entry: LogEntry): void {
    const color = this.colors[entry.level];
    const levelName = LogLevel[entry.level];

    const formatted = `${entry.timestamp.toISOString()} [${entry.name}/${levelName}] ${entry.formatted}`;
    const colored = color(formatted);

    process.stdout.write(`${colored}\n`);
  }
}

export interface FileConsumerOptions extends LogConsumerOptions {
  directory?: string;
}

export class FileConsumer extends LogConsumer {
  protected directory: string;

  #archiveLock = false;

  public constructor(options: FileConsumerOptions = {}) {
    super(options);
    this.directory = options.directory ?? path.join(getRootDirectory(), "logs");
  }

  protected override log(entry: LogEntry): void {
    const formatted = `${entry.timestamp.toISOString()} [${entry.name}/${LogLevel[entry.level]}] ${entry.formatted}`;

    const filename = `${entry.timestamp.toISOString().split("T")[0]  }.log`;
    const filepath = path.join(this.directory, filename);
    fs.mkdirSync(this.directory, { recursive: true });

    // Remove ANSI escape codes before writing to the file
    // See https://stackoverflow.com/a/29497680
    // eslint-disable-next-line no-control-regex
    fs.appendFileSync(filepath, `${formatted.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, "")  }\n`);

    this.archiveIfNeeded();
  }

  private static readonly p7zModuleHash: string | null = null;

  private archiveIfNeeded(): void {
    // eslint-disable-next-line @typescript-eslint/require-array-sort-compare
    const logFiles = fs.readdirSync(this.directory).sort();
    const needArchive = logFiles.filter(f => f.endsWith(".log") && f !== `${new Date().toISOString().split("T")[0]  }.log`);

    if (!this.#archiveLock && needArchive.length > 0) {
      this.#archiveLock = true;
      const stream = sz.update(
        path.join(this.directory, "archive.7z"),
        needArchive.map(f => path.join(this.directory, f)),
        {
          $bin: szBin.path7za,
          archiveType: "7z",
          method: ["0=lzma", "x=9", "fb=64", "d=32m", "s=on"],
        },
      );
      stream.on("end", () => {
        for (const file of needArchive) {
          fs.rmSync(path.join(this.directory, file));
        }
        // this.log(LogLevel.INFO, "Archived %d log files", needArchive.length);
        this.#archiveLock = false;
      });
    }
  }
}

export class Logger {
  protected name: string;
  protected consumers: LogConsumer[];

  public constructor(name: string, consumers: LogConsumer[] = []) {
    if (Logger.loggers.has(name)) {
      throw new Error(`Logger with name '${name}' already exists. Use Logger.getLogger() instead.`);
    }
    this.name = name;
    this.consumers = consumers;
  }

  public withConsumer(consumer: LogConsumer): this {
    this.consumers.push(consumer);
    return this;
  }

  protected static loggers = new Map<string, Logger>();

  public static getLogger(name: string): Logger {
    const existing = Logger.loggers.get(name);
    if (!existing) {
      const logger = new Logger(name);
      Logger.loggers.set(name, logger);
      return logger;
    }
    return existing;
  }

  protected log(level: LogLevel, message: string, ...args: unknown[]): void {
    for (const consumer of this.consumers) {
      // eslint-disable-next-line @typescript-eslint/dot-notation
      consumer["_log"](this.name, level, message, ...args);
    }
  }

  public debug(message: string, ...args: unknown[]): void {
    this.log(LogLevel.DEBUG, message, ...args);
  }

  public info(message: string, ...args: unknown[]): void {
    this.log(LogLevel.INFO, message, ...args);
  }

  public warn(message: string, ...args: unknown[]): void {
    this.log(LogLevel.WARN, message, ...args);
  }

  public error(message: string, ...args: unknown[]): void {
    this.log(LogLevel.ERROR, message, ...args);
  }
}
