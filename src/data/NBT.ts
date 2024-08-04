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

import * as zlib from "zlib";
import { MineBuffer } from "../../native";
import { Assert } from "../utils/Logic";

export enum NBTTagType {
  End = 0,
  Byte = 1,
  Short = 2,
  Int = 3,
  Long = 4,
  Float = 5,
  Double = 6,
  ByteArray = 7,
  String = 8,
  List = 9,
  Compound = 10,
  IntArray = 11,
  LongArray = 12,
}

export class Byte {
  public constructor(public value: number) {
    Assert.integerBetween(value, -128, 127);
  }

  public valueOf(): number {
    return this.value;
  }
}

export function byte(value: number): Byte {
  return new Byte(value);
}

export class Short {
  public constructor(public value: number) {
    Assert.integerBetween(value, -32768, 32767);
  }

  public valueOf(): number {
    return this.value;
  }
}

export function short(value: number): Short {
  return new Short(value);
}

export class Int {
  public constructor(public value: number) {
    Assert.integerBetween(value, -2147483648, 2147483647);
  }

  public valueOf(): number {
    return this.value;
  }
}

export function int(value: number): Int {
  return new Int(value);
}

export class Float {
  public constructor(public value: number) {
    Assert.numberBetween(value, -3.4028234663852886e38, 3.4028234663852886e38);
  }

  public valueOf(): number {
    return this.value;
  }
}

export function float(value: number): Float {
  return new Float(value);
}

export class Double {
  public constructor(public value: number) {
    Assert.numberBetween(value, -1.7976931348623157e308, 1.7976931348623157e308);
  }

  public valueOf(): number {
    return this.value;
  }
}

export function double(value: number): Double {
  return new Double(value);
}

export type Encodable =
  | undefined
  | Byte
  | boolean
  | Short
  | Int
  | bigint
  | Float
  | Double
  | string
  | Uint8Array
  | Int32Array
  | BigInt64Array
  | EncodableArray
  | { [key: string]: Encodable };

export type EncodableArray =
  | undefined[]
  | Byte[]
  | boolean[]
  | Short[]
  | Int[]
  | bigint[]
  | Float[]
  | Double[]
  | string[]
  | Uint8Array[]
  | Int32Array[]
  | BigInt64Array[]
  | { [key: string]: Encodable }[];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T, A extends any[] = any[]> = new (...args: A) => T;

// eslint-disable-next-line @typescript-eslint/ban-types
function isConstructor(ctor: Function): ctor is Constructor<unknown> {
  return typeof ctor === "function" && /^\s*class\s+/.test(ctor.toString());
}

function isArrayOf<T>(array: unknown, ctor: Constructor<T> | string | ((item: unknown) => item is T)): array is T[] {
  if (!Array.isArray(array)) {
    return false;
  }
  if (typeof ctor === "string") {
    return array.every(item => typeof item === ctor);
  } else if (typeof ctor === "function") {
    if (isConstructor(ctor)) {
      return array.every(item => item instanceof ctor);
    }
    return array.every(ctor);
  }
  return Array.isArray(array) && array.every(item => (typeof ctor === "string" ? typeof item === ctor : item instanceof ctor));
}

export function isEncodable(value: unknown): value is Encodable {
  const encodableTypes = [Byte, Short, Int, Float, Double, Uint8Array, Int32Array, BigInt64Array];
  if (typeof value === "undefined" || typeof value === "string" || typeof value === "bigint" || typeof value === "boolean") {
    return true;
  }
  if (encodableTypes.some(ctor => value instanceof ctor)) {
    return true;
  }
  if (isArrayOf(value, isEncodable)) {
    return true;
  }
  if (typeof value === "object" && value !== null && Object.getPrototypeOf(value) === Object.prototype && Object.values(value).every(isEncodable)) {
    return true;
  }
  return false;
}

export function getType<T extends Encodable>(value: T): NBTTagType {
  if (!isEncodable(value)) {
    throw new Error("Value is not encodable");
  } else if (value === undefined) {
    return NBTTagType.End;
  } else if (typeof value === "boolean" || value instanceof Byte) {
    return NBTTagType.Byte;
  } else if (value instanceof Short) {
    return NBTTagType.Short;
  } else if (value instanceof Int) {
    return NBTTagType.Int;
  } else if (value instanceof Float) {
    return NBTTagType.Float;
  } else if (value instanceof Double) {
    return NBTTagType.Double;
  } else if (typeof value === "bigint") {
    return NBTTagType.Long;
  } else if (value instanceof Uint8Array || isArrayOf(value, Byte)) {
    return NBTTagType.ByteArray;
  } else if (typeof value === "string") {
    return NBTTagType.String;
  } else if (value instanceof BigInt64Array || isArrayOf<bigint>(value, "bigint")) {
    return NBTTagType.LongArray;
  } else if (value instanceof Int32Array || isArrayOf(value, Int)) {
    return NBTTagType.IntArray;
  } else if (isArrayOf<Encodable>(value, isEncodable)) {
    return NBTTagType.List;
  } else if (
    typeof value === "object" &&
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    value !== null &&
    Object.getPrototypeOf(value) === Object.prototype &&
    Object.values(value as object).every(isEncodable)
  ) {
    return NBTTagType.Compound;
  } else {
    throw new Error("Value is not encodable (fall-through)");
  }
}

export class NBTTag<T extends NBTTagType = NBTTagType, V extends Encodable = Encodable> {
  public readonly type: T;
  public value: V;
  public name?: string;

  public constructor(type: T, value: V, name?: string) {
    this.type = type;
    this.value = value;
    this.name = name;
  }
}

export function tag<T extends NBTTagType = NBTTagType, V extends Encodable = Encodable>(type: T, value: V, name?: string): NBTTag<T, V> {
  return new NBTTag(type, value, name);
}

export interface EncodeOptions {
  name?: boolean | string;
  type?: boolean;
  gzip?: boolean;
}

export class Encoder {
  public readonly buffer: MineBuffer;

  public constructor(buffer: MineBuffer = new MineBuffer()) {
    this.buffer = buffer;
  }

  public encode(value: Encodable | NBTTag, options: EncodeOptions = {}): this {
    this.encodeTag(value instanceof NBTTag ? value : tag(getType(value), value), options);
    if (options.gzip) {
      const zipped = zlib.gzipSync(this.buffer.getBuffer());
      this.buffer.reset();
      this.buffer.writeBytes(zipped);
    }
    return this;
  }

  protected encodeTag(tag: NBTTag, options: EncodeOptions = {}): this {
    if (options.type ?? true) {
      this.buffer.writeByte(tag.type);
    }
    if (((options.name ?? true) && tag.name) || typeof options.name === "string") {
      const name = tag.name ?? (typeof options.name === "string" ? options.name : "");
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      this.buffer.writeShort(name.length ?? 0);
      if (name) {
        this.buffer.writeBytes(Buffer.from(name, "utf8"));
      }
    }
    switch (tag.type) {
      case NBTTagType.End:
        break;
      case NBTTagType.Byte: {
        const value = (tag as NBTTag<NBTTagType.Byte, Byte | boolean>).value;
        this.buffer.writeByte(value instanceof Byte ? value.value : value ? 1 : 0);
        break;
      }
      case NBTTagType.Short:
        this.buffer.writeShort((tag as NBTTag<NBTTagType.Short, Short>).value.value);
        break;
      case NBTTagType.Int:
        this.buffer.writeInt((tag as NBTTag<NBTTagType.Int, Int>).value.value);
        break;
      case NBTTagType.Float:
        this.buffer.writeFloat((tag as NBTTag<NBTTagType.Float, Float>).value.value);
        break;
      case NBTTagType.Double:
        this.buffer.writeDouble((tag as NBTTag<NBTTagType.Double, Double>).value.value);
        break;
      case NBTTagType.Long:
        this.buffer.writeLong((tag as NBTTag<NBTTagType.Long, bigint>).value);
        break;
      case NBTTagType.ByteArray:
        this.buffer.writeInt((tag as NBTTag<NBTTagType.ByteArray, Uint8Array>).value.length);
        this.buffer.writeBytes(Buffer.from((tag as NBTTag<NBTTagType.ByteArray, Uint8Array>).value));
        break;
      case NBTTagType.String:
        this.buffer.writeShort((tag as NBTTag<NBTTagType.String, string>).value.length);
        this.buffer.writeBytes(Buffer.from((tag as NBTTag<NBTTagType.String, string>).value, "utf8"));
        break;
      case NBTTagType.List:
        this.buffer.writeByte(getType((tag as NBTTag<NBTTagType.List, EncodableArray>).value[0]));
        this.buffer.writeInt((tag as NBTTag<NBTTagType.List, EncodableArray>).value.length);
        for (const item of (tag as NBTTag<NBTTagType.List, EncodableArray>).value) {
          // Check that all items are the same type
          if (getType(item) !== getType((tag as NBTTag<NBTTagType.List, EncodableArray>).value[0])) {
            throw new Error("All items in a list must be the same type");
          }
          this.encode(item, { name: false, type: false });
        }
        break;
      case NBTTagType.Compound:
        for (const [key, value] of Object.entries((tag as NBTTag<NBTTagType.Compound, Record<string, Encodable>>).value)) {
          if (getType(value) === NBTTagType.End) {
            throw new Error("Compound value cannot be empty");
          }
          this.encode(value, { name: key, type: true });
        }
        this.buffer.writeByte(NBTTagType.End);
        break;
      case NBTTagType.IntArray:
        this.buffer.writeInt((tag as NBTTag<NBTTagType.IntArray, Int32Array>).value.length);
        this.buffer.reserve((tag as NBTTag<NBTTagType.IntArray, Int32Array>).value.length * 4);
        for (const value of (tag as NBTTag<NBTTagType.IntArray, Int32Array>).value) {
          this.buffer.writeInt(value);
        }
        break;
      case NBTTagType.LongArray:
        this.buffer.writeInt((tag as NBTTag<NBTTagType.LongArray, BigInt64Array>).value.length);
        this.buffer.reserve((tag as NBTTag<NBTTagType.LongArray, BigInt64Array>).value.length * 8);
        for (const value of (tag as NBTTag<NBTTagType.LongArray, BigInt64Array>).value) {
          this.buffer.writeLong(value);
        }
        break;
      default:
        throw new Error("Unsupported tag type");
    }
    return this;
  }
}

export interface DecodeOptions {
  name?: boolean;
  type?: NBTTagType;
}

export class Decoder {
  public readonly buffer: MineBuffer;

  // TODO: clean up gzip handling
  public constructor(buffer: Buffer | MineBuffer = new MineBuffer(), gzip = false) {
    this.buffer = buffer instanceof MineBuffer ? buffer : new MineBuffer(buffer);
    if (gzip) {
      const unzipped = zlib.gunzipSync(this.buffer.getBuffer());
      this.buffer.reset();
      this.buffer.writeBytes(unzipped);
    }
  }

  public decode(options: DecodeOptions = {}): Encodable {
    return this.decodeTag(options).value;
  }

  protected decodeTag(options: DecodeOptions = {}): NBTTag {
    const type = options.type ?? this.buffer.readByte();
    if (type === NBTTagType.End) {
      return tag(NBTTagType.End, undefined);
    }
    let name: string | undefined;
    if (options.name ?? true) {
      const nameLength = this.buffer.readShort();
      name = nameLength > 0 ? this.buffer.readBytes(nameLength).toString("utf8") : undefined;
    }
    switch (type) {
      // case TagType.End:
      //   return tag(TagType.End, undefined, name);
      case NBTTagType.Byte:
        return tag(NBTTagType.Byte, byte(this.buffer.readByte()), name);
      case NBTTagType.Short:
        return tag(NBTTagType.Short, short(this.buffer.readShort()), name);
      case NBTTagType.Int:
        return tag(NBTTagType.Int, int(this.buffer.readInt()), name);
      case NBTTagType.Float:
        return tag(NBTTagType.Float, float(this.buffer.readFloat()), name);
      case NBTTagType.Double:
        return tag(NBTTagType.Double, double(this.buffer.readDouble()), name);
      case NBTTagType.Long:
        return tag(NBTTagType.Long, this.buffer.readLong(), name);
      case NBTTagType.ByteArray:
        return tag(NBTTagType.ByteArray, this.buffer.readBytes(this.buffer.readInt()), name);
      case NBTTagType.String:
        return tag(NBTTagType.String, this.buffer.readBytes(this.buffer.readShort()).toString("utf8"), name);
      case NBTTagType.List: {
        const listType = this.buffer.readByte();
        const listLength = this.buffer.readInt();
        const list: Encodable[] = [];
        for (let i = 0; i < listLength; i++) {
          list.push(this.decode({ name: false, type: listType }));
        }
        return tag(NBTTagType.List, list as EncodableArray, name);
      }
      case NBTTagType.Compound: {
        const compound: Record<string, Encodable> = {};
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        while (true) {
          const tag = this.decodeTag({ name: true });
          if (tag.type === NBTTagType.End) {
            break;
          }
          if (typeof tag.name === "undefined") {
            throw new Error("Compound entry name cannot be empty");
          }
          compound[tag.name] = tag.value;
        }
        return tag(NBTTagType.Compound, compound, name);
      }
      case NBTTagType.IntArray: {
        const intArrayLength = this.buffer.readInt();
        const intArray: Int32Array = new Int32Array(intArrayLength);
        for (let i = 0; i < intArrayLength; i++) {
          intArray[i] = this.buffer.readInt();
        }
        return tag(NBTTagType.IntArray, intArray, name);
      }
      case NBTTagType.LongArray: {
        const longArrayLength = this.buffer.readInt();
        const longArray: BigInt64Array = new BigInt64Array(longArrayLength);
        for (let i = 0; i < longArrayLength; i++) {
          longArray[i] = this.buffer.readLong();
        }
        return tag(NBTTagType.LongArray, longArray, name);
      }
      default:
        throw new Error("Unsupported tag type");
    }
  }
}

export function decodeNBT(buffer: MineBuffer, options: DecodeOptions = {}, gzip = false): Encodable {
  return new Decoder(buffer, gzip).decode(options);
}

export function encodeNBT(buffer: MineBuffer, value: Encodable, options: EncodeOptions = {}): void {
  new Encoder(buffer).encode(value, options);
}
