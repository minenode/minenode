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

import EventEmitter from "eventemitter3";
import Server from "../server/Server";

const kDestroy = Symbol("destroy");

interface Destroyable {
  [kDestroy]: () => void;
}

// eslint-disable-next-line @typescript-eslint/ban-types
export abstract class Base<T, E extends object = {}> extends EventEmitter<E & { destroy: [] }> implements Destroyable {
  #initialized = false;

  public readonly server: Server;

  protected constructor(server: Server) {
    super();
    this.server = server;
  }

  public [kDestroy](): void {
    this._destroy();
    // this.emit("destroy");
    this.removeAllListeners();
    this.#initialized = false;
  }

  protected _check<K extends keyof this>(property: K): Exclude<this[K], null | undefined> {
    if (!this.#initialized) {
      throw new Error(`${this.constructor.name}#${property.toString()} accessed before initialize`);
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    } else if (this[property] === null || typeof this[property] === "undefined") {
      throw new Error(`${this.constructor.name}#${property.toString()} is null`);
    }
    return this[property] as Exclude<this[K], null | undefined>;
  }

  protected _assert(condition: unknown, message: string): asserts condition {
    if (!condition) {
      throw new Error(message);
    }
  }

  protected _assertInitialized(property: string): true {
    if (!this.#initialized) {
      throw new Error(`${this.constructor.name}#${property}() called before initialized`);
    }
    return true;
  }

  protected abstract _tick(tick: number): void;

  public nextTick(): Promise<number> {
    return this.server.nextTick();
  }

  protected abstract _initialize(options: T): void;

  protected __baseInitialize(options: T): void {
    if (this.#initialized) {
      throw new Error("Base already initialized");
    }
    this._initialize(options);
    this.#initialized = true;
  }

  protected abstract _destroy(): void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function destroy(base: Destroyable): void {
  base[kDestroy]();
}
