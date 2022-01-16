/*
 * Copyright (C) 2022 MineNode
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

export class Performance {
  public readonly samples: { [i: number]: bigint | number | undefined };
  public readonly n: number;

  public constructor(n: number) {
    this.samples = new Array(n);
    this.n = n;
  }

  public start(): void {
    this.samples[this.n - 1] = process.hrtime.bigint();
  }

  public tick(): void {
    // Shift samples
    for (let i = 0; i < this.n - 1; i++) {
      this.samples[i] = this.samples[i + 1];
    }
    // Record diff to last sample
    if (typeof this.samples[this.n - 2] === "bigint") {
      this.samples[this.n - 2] = Number(process.hrtime.bigint() - (this.samples[this.n - 2] as bigint));
    }
    this.samples[this.n - 1] = process.hrtime.bigint();
  }

  public get average(): number {
    let sum: number | undefined = undefined;
    let count = 0;
    for (let i = 0; i < this.n - 1; i++) {
      if (typeof this.samples[i] !== "number") {
        continue;
      } else if (typeof sum === "undefined") {
        sum = this.samples[i] as number;
        count++;
      } else {
        sum += this.samples[i] as number;
        count++;
      }
    }
    if (typeof sum === "undefined") {
      return 0;
    }
    return sum / count;
  }
}
