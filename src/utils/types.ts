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

export type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

export function mut<T>(obj: T): Mutable<T> {
  return obj;
}

export function mutate<T, K extends keyof T>(obj: T, k: K, v: Mutable<T>[K]): void {
  obj[k] = v;
}

export type Callable<T extends any[], U> = (...t: T) => U;
export type Provider<T> = Callable<[], T>;
export type Consumer<T> = Callable<[T], void>;
