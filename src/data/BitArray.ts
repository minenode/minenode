/* eslint-disable license-header/header */
import { MineBuffer } from "../../native";
// Adapted from:
// https://github.dev/PrismarineJS/prismarine-chunk/blob/3e617d8e39ed9863c46fe99c296eef82fc9eabaa/src/pc/common/BitArray.js
// License: MIT

interface ReadWriteArrayLike<T> {
  [i: number]: T;
  readonly length: number;
}

export interface BitArrayOptions {
  data?: Uint32Array;
  capacity: number;
  bitsPerValue: number;
  value?: number;
}

export interface BitArrayBase {
  get(index: number): number;
  set(index: number, value: number): void;
}

export class BitArray implements BitArrayBase {
  protected data: ReadWriteArrayLike<number>;
  protected valueMask: number;
  public capacity: number;
  public bitsPerValue: number;

  public constructor(options: BitArrayOptions) {
    const size = Math.ceil((options.capacity * options.bitsPerValue) / 32);
    const data = options.data ?? new Uint32Array(size).fill(0);
    const valueMask = (1 << options.bitsPerValue) - 1;

    this.data = data;
    this.capacity = options.capacity;
    this.bitsPerValue = options.bitsPerValue;
    this.valueMask = valueMask;

    if (options.value !== undefined) {
      this.fill(options.value);
    }
  }

  // TODO: optimeze this method
  public fill(value: number): void {
    for (let i = 0; i < this.capacity; i++) {
      this.set(i, value);
    }
  }

  public get(index: number): number {
    const bitIndex = index * this.bitsPerValue;
    const startLongIndex = bitIndex >>> 5;
    const startLong = this.data[startLongIndex];
    const indexInStartLong = bitIndex & 31;
    let result = startLong >>> indexInStartLong;
    const endBitOffset = indexInStartLong + this.bitsPerValue;
    if (endBitOffset > 32) {
      const endLong = this.data[startLongIndex + 1];
      result |= endLong << (32 - indexInStartLong);
    }
    return result & this.valueMask;
  }

  public set(index: number, value: number): void {
    const bitIndex = index * this.bitsPerValue;
    const startLongIndex = bitIndex >>> 5;
    const indexInStartLong = bitIndex & 31;

    this.data[startLongIndex] = ((this.data[startLongIndex] & ~(this.valueMask << indexInStartLong)) | ((value & this.valueMask) << indexInStartLong)) >>> 0;
    const endBitOffset = indexInStartLong + this.bitsPerValue;
    if (endBitOffset > 32) {
      this.data[startLongIndex + 1] = ((this.data[startLongIndex + 1] & ~((1 << (endBitOffset - 32)) - 1)) | (value >> (32 - indexInStartLong))) >>> 0;
    }
  }

  public resizeTo(newBitsPerValue: number): BitArray {
    const newArray = new BitArray({
      capacity: this.capacity,
      bitsPerValue: newBitsPerValue,
    });
    for (let i = 0; i < this.capacity; i++) {
      const value = this.get(i);
      if (Math.clz32(value) < newBitsPerValue) {
        throw new RangeError(`Value ${value} is too large for ${newBitsPerValue} bits`);
      }
      newArray.set(i, value);
    }
    return newArray;
  }

  public resize(newCapacity: number): BitArray {
    const newArr = new BitArray({
      bitsPerValue: this.bitsPerValue,
      capacity: newCapacity,
    });
    for (let i = 0; i < Math.min(newCapacity, this.capacity); ++i) {
      newArr.set(i, this.get(i));
    }

    return newArr;
  }

  public size(): number {
    return Math.ceil(this.data.length / 2);
  }

  public sizeInBytes(): number {
    return (this.data.length * this.bitsPerValue) / 8;
  }

  public readBuffer(buffer: MineBuffer): this {
    for (let i = 0; i < this.data.length; i += 2) {
      this.data[i + 1] = buffer.readUInt();
      this.data[i] = buffer.readUInt();
    }
    return this;
  }

  public writeBuffer(buffer: MineBuffer): this {
    for (let i = 0; i < this.data.length; i += 2) {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      buffer.writeUInt(this.data[i + 1] ?? 0);
      buffer.writeUInt(this.data[i]);
    }
    return this;
  }

  public getBitsPerValue(): number {
    return this.bitsPerValue;
  }

  public toString(): string {
    return `BitArray(capacity=${this.capacity}, bitsPerValue=${this.bitsPerValue}, len=${this.data.length})`;
  }

  public toJson() {
    return {
      capacity: this.capacity,
      bitsPerValue: this.bitsPerValue,
      data: Array.from(new Uint32Array(this.data)),
    };
  }

  public static from(json: ReturnType<BitArray["toJson"]>): BitArray {
    const bit = new BitArray({
      capacity: json.capacity,
      bitsPerValue: json.bitsPerValue,
      data: new Uint32Array(json.data),
    });
    return bit;
  }

  public static fromArray(array: ReadWriteArrayLike<number>, bitsPerValue: number): BitArray {
    const data = [];
    let i = 0;
    let curLong = 0;
    let curBit = 0;
    while (i < array.length) {
      curLong |= array[i] << curBit;
      curBit += bitsPerValue;
      if (curBit > 32) {
        data.push(curLong & 0xffffffff);
        curBit -= 32;
        curLong = array[i] >>> (bitsPerValue - curBit);
      }
      i++;
    }
    if (curBit > 0) {
      data.push(curLong);
    }
    return new BitArray({
      capacity: (array.length * 32) / bitsPerValue,
      bitsPerValue,
      data: new Uint32Array(data), // TODO: this is copying the array, may be inefficient
    });
  }
}
