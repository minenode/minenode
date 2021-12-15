// NBT.ts - read/write utilities for NBT data
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

import { Assert } from "../utils/Logic";
import MineBuffer from "../utils/MineBuffer";
import * as zlib from "zlib";

export enum TagType {
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
    } else {
      return array.every(ctor);
    }
  }
  return Array.isArray(array) && array.every(item => (typeof ctor === "string" ? typeof item === ctor : item instanceof ctor));
}

export function isEncodable(value: unknown): value is Encodable {
  const encodableTypes = [Byte, Short, Int, Float, Double, Uint8Array, Int32Array, BigInt64Array];
  if (typeof value === "undefined" || typeof value === "string" || typeof value === "bigint") {
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

export function getType<T extends Encodable>(value: T): TagType {
  if (!isEncodable(value)) {
    throw new Error("Value is not encodable");
  } else if (value === undefined) {
    return TagType.End;
  } else if (value instanceof Byte) {
    return TagType.Byte;
  } else if (value instanceof Short) {
    return TagType.Short;
  } else if (value instanceof Int) {
    return TagType.Int;
  } else if (value instanceof Float) {
    return TagType.Float;
  } else if (value instanceof Double) {
    return TagType.Double;
  } else if (typeof value === "bigint") {
    return TagType.Long;
  } else if (value instanceof Uint8Array || isArrayOf(value, Byte)) {
    return TagType.ByteArray;
  } else if (typeof value === "string") {
    return TagType.String;
  } else if (isArrayOf<Encodable>(value, isEncodable)) {
    return TagType.List;
  } else if (value instanceof Int32Array || isArrayOf(value, Int)) {
    return TagType.IntArray;
  } else if (value instanceof BigInt64Array || isArrayOf<bigint>(value, "bigint")) {
    return TagType.LongArray;
  } else if (
    typeof value === "object" &&
    value !== null &&
    Object.getPrototypeOf(value) === Object.prototype &&
    Object.values(value as object).every(isEncodable)
  ) {
    return TagType.Compound;
  } else {
    throw new Error("Value is not encodable (fall-through)");
  }
}

export class Tag<T extends TagType = TagType, V extends Encodable = Encodable> {
  public readonly type: T;
  public value: V;
  public name?: string;

  public constructor(type: T, value: V, name?: string) {
    this.type = type;
    this.value = value;
    this.name = name;
  }
}

export function tag<T extends TagType = TagType, V extends Encodable = Encodable>(type: T, value: V, name?: string): Tag<T, V> {
  return new Tag(type, value, name);
}

interface EncodeOptions {
  name?: boolean | string;
  type?: boolean;
  gzip?: boolean;
}

export class Encoder {
  public readonly buffer: MineBuffer;

  public constructor(buffer: MineBuffer = new MineBuffer()) {
    this.buffer = buffer;
  }

  public encode(value: Encodable | Tag, options: EncodeOptions = {}): this {
    this.encodeTag(value instanceof Tag ? value : tag(getType(value), value), options);
    if (options.gzip) {
      const zipped = zlib.gzipSync(this.buffer.getBuffer());
      this.buffer.reset().writeBytes(zipped);
    }
    return this;
  }

  protected encodeTag(tag: Tag, options: EncodeOptions = {}): this {
    if (options.type ?? true) {
      this.buffer.writeByte(tag.type);
    }
    if (((options.name ?? true) && tag.name) || typeof options.name === "string") {
      const name = tag.name ?? (typeof options.name === "string" ? options.name : "");
      this.buffer.writeShort(name?.length ?? 0);
      if (name) {
        this.buffer.writeBytes(Buffer.from(name, "utf8"));
      }
    }
    switch (tag.type) {
      case TagType.End:
        break;
      case TagType.Byte:
        this.buffer.writeByte((tag as Tag<TagType.Byte, Byte>).value.value);
        break;
      case TagType.Short:
        this.buffer.writeShort((tag as Tag<TagType.Short, Short>).value.value);
        break;
      case TagType.Int:
        this.buffer.writeInt((tag as Tag<TagType.Int, Int>).value.value);
        break;
      case TagType.Float:
        this.buffer.writeFloat((tag as Tag<TagType.Float, Float>).value.value);
        break;
      case TagType.Double:
        this.buffer.writeDouble((tag as Tag<TagType.Double, Double>).value.value);
        break;
      case TagType.Long:
        this.buffer.writeLong((tag as Tag<TagType.Long, bigint>).value);
        break;
      case TagType.ByteArray:
        this.buffer.writeInt((tag as Tag<TagType.ByteArray, Uint8Array>).value.length);
        this.buffer.writeBytes((tag as Tag<TagType.ByteArray, Uint8Array>).value);
        break;
      case TagType.String:
        this.buffer.writeShort((tag as Tag<TagType.String, string>).value.length);
        this.buffer.writeBytes(Buffer.from((tag as Tag<TagType.String, string>).value, "utf8"));
        break;
      case TagType.List:
        this.buffer.writeByte(getType((tag as Tag<TagType.List, EncodableArray>).value[0]));
        this.buffer.writeInt((tag as Tag<TagType.List, EncodableArray>).value.length);
        for (const item of (tag as Tag<TagType.List, EncodableArray>).value) {
          // Check that all items are the same type
          if (getType(item) !== getType((tag as Tag<TagType.List, EncodableArray>).value[0])) {
            throw new Error("All items in a list must be the same type");
          }
          this.encode(item, { name: false, type: false });
        }
        break;
      case TagType.Compound:
        for (const [key, value] of Object.entries((tag as Tag<TagType.Compound, Record<string, Encodable>>).value)) {
          if (getType(value) === TagType.End) {
            throw new Error("Compound value cannot be empty");
          }
          this.encode(value, { name: key, type: true });
        }
        this.buffer.writeByte(TagType.End);
        break;
      case TagType.IntArray:
        this.buffer.writeInt((tag as Tag<TagType.IntArray, Int32Array>).value.length);
        this.buffer.reserve((tag as Tag<TagType.IntArray, Int32Array>).value.length * 4);
        for (const value of (tag as Tag<TagType.IntArray, Int32Array>).value) {
          this.buffer.writeInt(value);
        }
        break;
      case TagType.LongArray:
        this.buffer.writeInt((tag as Tag<TagType.LongArray, BigInt64Array>).value.length);
        this.buffer.reserve((tag as Tag<TagType.LongArray, BigInt64Array>).value.length * 8);
        for (const value of (tag as Tag<TagType.LongArray, BigInt64Array>).value) {
          this.buffer.writeLong(value);
        }
        break;
      default:
        throw new Error("Unsupported tag type");
    }
    return this;
  }
}

interface DecodeOptions {
  name?: boolean;
  type?: TagType;
}

export class Decoder {
  public readonly buffer: MineBuffer;

  // TODO: clean up gzip handling
  public constructor(buffer: Buffer | MineBuffer = new MineBuffer(), gzip = false) {
    this.buffer = buffer instanceof MineBuffer ? buffer : new MineBuffer(buffer);
    if (gzip) {
      const unzipped = zlib.gunzipSync(this.buffer.getBuffer());
      this.buffer.reset().writeBytes(unzipped);
    }
  }

  public decode(options: DecodeOptions = {}): Encodable {
    return this.decodeTag(options).value;
  }

  protected decodeTag(options: DecodeOptions = {}): Tag {
    const type = options.type ?? this.buffer.readByte();
    if (type === TagType.End) {
      return tag(TagType.End, undefined);
    }
    let name: string | undefined;
    if (options.name ?? true) {
      const nameLength = this.buffer.readShort();
      name = nameLength > 0 ? this.buffer.readBytes(nameLength).toString("utf8") : undefined;
    }
    switch (type) {
      // case TagType.End:
      //   return tag(TagType.End, undefined, name);
      case TagType.Byte:
        return tag(TagType.Byte, byte(this.buffer.readByte()), name);
      case TagType.Short:
        return tag(TagType.Short, short(this.buffer.readShort()), name);
      case TagType.Int:
        return tag(TagType.Int, int(this.buffer.readInt()), name);
      case TagType.Float:
        return tag(TagType.Float, float(this.buffer.readFloat()), name);
      case TagType.Double:
        return tag(TagType.Double, double(this.buffer.readDouble()), name);
      case TagType.Long:
        return tag(TagType.Long, this.buffer.readLong(), name);
      case TagType.ByteArray:
        return tag(TagType.ByteArray, this.buffer.readBytes(this.buffer.readInt()), name);
      case TagType.String:
        return tag(TagType.String, this.buffer.readBytes(this.buffer.readShort()).toString("utf8"), name);
      case TagType.List: {
        const listType = this.buffer.readByte();
        const listLength = this.buffer.readInt();
        const list: Encodable[] = [];
        for (let i = 0; i < listLength; i++) {
          list.push(this.decode({ name: false, type: listType }));
        }
        return tag(TagType.List, list as EncodableArray, name);
      }
      case TagType.Compound: {
        const compound: Record<string, Encodable> = {};
        // eslint-disable-next-line no-constant-condition
        while (true) {
          const tag = this.decodeTag({ name: true });
          if (tag.type === TagType.End) {
            break;
          }
          if (typeof tag.name === "undefined") {
            throw new Error("Compound entry name cannot be empty");
          }
          compound[tag.name] = tag.value;
        }
        return tag(TagType.Compound, compound, name);
      }
      case TagType.IntArray: {
        const intArrayLength = this.buffer.readInt();
        const intArray: Int32Array = new Int32Array(intArrayLength);
        for (let i = 0; i < intArrayLength; i++) {
          intArray[i] = this.buffer.readInt();
        }
        return tag(TagType.IntArray, intArray, name);
      }
      case TagType.LongArray: {
        const longArrayLength = this.buffer.readInt();
        const longArray: BigInt64Array = new BigInt64Array(longArrayLength);
        for (let i = 0; i < longArrayLength; i++) {
          longArray[i] = this.buffer.readLong();
        }
        return tag(TagType.LongArray, longArray, name);
      }
      default:
        throw new Error("Unsupported tag type");
    }
  }
}
