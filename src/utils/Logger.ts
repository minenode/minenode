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

export class Logger {
  public constructor(public readonly prefix: string) {}

  protected log(level: LogLevel, message: string): void {
    const format = {
      [LogLevel.DEBUG]: chalk.greenBright,
      [LogLevel.VERBOSE]: chalk.cyanBright,
      [LogLevel.INFO]: chalk.white,
      [LogLevel.WARN]: chalk.bold.yellowBright,
      [LogLevel.ERROR]: chalk.bold.red,
    }[level];
    // eslint-disable-next-line no-console
    console.log(format(`${process.uptime().toFixed(9)} [${this.prefix}/${level}] ${message}`));
    // TODO: write to file
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
}

export class LogManager {
  private static loggerInstance: Logger | null = null;

  public static getLogger(): Logger {
    if (!this.loggerInstance) this.loggerInstance = new Logger("server");
    return this.loggerInstance;
  }
}
