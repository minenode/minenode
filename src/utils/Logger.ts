// Logger.ts - Logging class and utilities
// Copyright (C) 2020 MineNode
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

import chalk = require("chalk");

export enum LogLevel {
  DEBUG = "DEBUG",
  VERBOSE = "VERBOSE",
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
}

export interface ILogger {
  log(level: LogLevel, message: string): void;
  debug(message: string): void;
  verbose(message: string): void;
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
  child(child: string): ILogger;
  parent(): ILogger | null;
  root(): ILogger;
}

export abstract class BaseLogger implements ILogger {
  public constructor(public readonly prefix: string, protected readonly _parent: BaseLogger | null = null) {}

  protected abstract _handle(prefix: string, level: LogLevel, message: string): void;

  public log(level: LogLevel, message: string): void {
    this.root()._handle(this.prefix, level, message);
  }

  public debug(message: string): void {
    this.log(LogLevel.DEBUG, message);
  }

  public verbose(message: string): void {
    this.log(LogLevel.VERBOSE, message);
  }

  public info(message: string): void {
    this.log(LogLevel.INFO, message);
  }

  public warn(message: string): void {
    this.log(LogLevel.WARN, message);
  }

  public error(message: string): void {
    this.log(LogLevel.ERROR, message);
  }

  public abstract child(child: string): BaseLogger;

  public abstract parent(): BaseLogger | null;

  public abstract root(): BaseLogger;
}

export class Logger extends BaseLogger implements ILogger {
  private childLoggers: Map<string, Logger> = new Map();

  public constructor(prefix: string, _parent: Logger | null = null) {
    super(prefix, _parent);
  }

  protected _handle(prefix: string, level: LogLevel, message: string): void {
    const format = {
      [LogLevel.DEBUG]: chalk.greenBright,
      [LogLevel.VERBOSE]: chalk.cyanBright,
      [LogLevel.INFO]: chalk.white,
      [LogLevel.WARN]: chalk.bold.yellowBright,
      [LogLevel.ERROR]: chalk.bold.red,
    }[level];
    // eslint-disable-next-line no-console
    console.log(format(`${process.uptime().toFixed(9)} [${prefix}/${level}] ${message}`));
    // TODO: write to file
  }

  public child(child: string): Logger {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    if (this.childLoggers.has(child)) return this.childLoggers.get(child)!;
    const newLogger = new Logger(child, this);
    this.childLoggers.set(child, newLogger);
    return newLogger;
  }

  public parent(): Logger | null {
    return this._parent as Logger | null;
  }

  public root(): Logger {
    let res;
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    for (let n: Logger = this; n._parent; n = n._parent as Logger) res = n;
    return res || this;
  }
}
