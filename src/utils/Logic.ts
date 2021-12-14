// Logic.ts - logic and assertion functions
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

export class Assert extends null {
  private constructor() {
    // Do nothing
  }

  public static integerBetween(value: unknown, min: number, max: number): asserts value is number {
    if (typeof value !== "number") {
      throw new Error(`Expected number, got ${typeof value}`);
    }
    // Check if value is an integer
    if (value % 1 !== 0) {
      throw new TypeError(`${value} is not an integer`);
    }
    // Check if value is between min and max
    if (value < min) {
      throw new RangeError(`value ${value} is less than min ${min}`);
    }
    if (value > max) {
      throw new RangeError(`value ${value} is greater than max ${max}`);
    }
  }

  public static bigintBetween(value: unknown, min: bigint, max: bigint): asserts value is bigint {
    // Check if value is a bigint
    if (typeof value !== "bigint") {
      throw new TypeError(`${value} is not a bigint`);
    }
    // Check if value is between min and max
    if (value < min) {
      throw new RangeError(`value ${value} is less than min ${min}`);
    }
    if (value > max) {
      throw new RangeError(`value ${value} is greater than max ${max}`);
    }
  }

  public static numberBetween(value: unknown, min: number, max: number): asserts value is number {
    if (typeof value !== "number") {
      throw new Error(`Expected number, got ${typeof value}`);
    }
    // Check if value is between min and max
    if (value < min) {
      throw new RangeError(`value ${value} is less than min ${min}`);
    }
    if (value > max) {
      throw new RangeError(`value ${value} is greater than max ${max}`);
    }
  }
}
