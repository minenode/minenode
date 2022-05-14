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

export function parallel<T, U>(set: Iterable<T>, fn: (t: T) => U | Promise<U>): Promise<U[]> {
  const promises: (U | Promise<U>)[] = [];
  for (const t of set) {
    promises.push(fn(t));
  }
  return Promise.all(promises);
}

export function* filtered<T>(set: Iterable<T>, fn: (t: T) => boolean): Iterable<T> {
  for (const t of set) {
    if (fn(t)) {
      yield t;
    }
  }
}

export function filter<T>(set: Iterable<T>, fn: (t: T) => boolean): T[] {
  return [...filtered(set, fn)];
}

export function* filterMapped<T, U>(set: Iterable<T>, filter: (t: T) => boolean, map: (t: T) => U): Iterable<U> {
  for (const t of set) {
    if (filter(t)) {
      yield map(t);
    }
  }
}

export function filterMap<T, U>(set: Iterable<T>, filter: (t: T) => boolean, map: (t: T) => U): U[] {
  return [...filterMapped(set, filter, map)];
}

export function filterCount<T>(set: Iterable<T>, fn: (t: T) => boolean): number {
  let count = 0;
  for (const t of set) {
    if (fn(t)) {
      count++;
    }
  }
  return count;
}

export function find<T>(set: Iterable<T>, fn: (t: T) => boolean): T | undefined {
  for (const t of set) {
    if (fn(t)) {
      return t;
    }
  }
  return void 0;
}

export function first<T>(set: Iterable<T>): T | undefined {
  return find(set, () => true);
}
