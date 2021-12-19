import EventEmitter from "eventemitter3";
import Server from "../server/Server";

const kDestroy = Symbol("destroy");

interface Destroyable {
  [kDestroy](): void;
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
      throw new Error(`${this.constructor.name}#${property} accessed before initialize`);
    } else if (this[property] === null || typeof this[property] === "undefined") {
      throw new Error(`${this.constructor.name}#${property} is null`);
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
