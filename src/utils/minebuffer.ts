// minebuffer.ts - a binary buffer supporting Minecraft protocol types
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

import Long from "long";

export const ALLOC_SIZE = 1024;
export const EXPAND_THRESHOLD = 32;

/**
 * A wrapper around a Buffer offering dynamic size and support for Minecraft protocol types.
 */
export default class MineBuffer {
  public buffer: Buffer;
  public writeOffset = 0;
  public readOffset = 0;

  public constructor(buffer?: Uint8Array) {
    if (typeof buffer === "undefined") {
      this.buffer = Buffer.alloc(ALLOC_SIZE);
    } else {
      this.buffer = Buffer.from(buffer);
    }
  }

  /**
   * Returns the managed portion `(0 ... writeOffset)` of the buffer.
   */
  public getBuffer(): Buffer {
    return this.buffer.slice(0, this.writeOffset);
  }

  /**
   * Creates a new, independent MineBuffer instance with the same state as this one.
   */
  public clone(): MineBuffer {
    const cloned = new MineBuffer(this.buffer);
    cloned.writeOffset = this.writeOffset;
    cloned.readOffset = this.readOffset;
    return cloned;
  }

  /**
   * Reads a byte (signed) from the buffer.
   * @throws {RangeError} if the buffer is exhausted.
   */
  public readByte(): number {
    if (this.readOffset + 1 > this.writeOffset) throw new RangeError("read() out-of-bounds");
    return this.buffer.readInt8(this.readOffset++);
  }

  /**
   * Reads multiple bytes from the buffer.
   * @param n the number of bytes to read (positive integer)
   * @throws {RangeError} if the buffer is exhausted.
   */
  public readBytes(n: number): Buffer {
    if (n < 0 || ~~n !== n) throw new RangeError("n must be a positive integer");
    if (this.readOffset + n > this.writeOffset) throw new RangeError("readBytes() out-of-bounds");
    const res = this.buffer.slice(this.readOffset, this.readOffset + n);
    this.readOffset += n;
    return res;
  }

  /**
   * Reads a variable-length integer (VarInt).
   * @throws {Error} if the VarInt is too large
   */
  public readVarInt(): number {
    let numRead = 0,
      result = 0;
    let read;
    do {
      read = this.readByte();
      const value = read & 0b01111111;
      result |= value << (7 * numRead);
      numRead++;
      if (numRead > 5) throw new Error("VarInt is too big");
    } while ((read & 0b10000000) != 0);
    return result;
  }

  /**
   * Reads a variable-length long integer (VarLong).
   * Returns a Long (long.js) object.
   * @throws {Error} if the VarLong is too large.
   */
  public readVarLong(): Long {
    let numRead = 0,
      result = Long.ZERO;
    let read;
    do {
      read = this.readByte();
      const value = new Long(read & 0b01111111);
      result = result.or(value.shiftLeft(7 * numRead));
      numRead++;
      if (numRead > 10) throw new Error("VarLong is too big");
    } while ((read & 0b10000000) != 0);
    return result;
  }

  /**
   * Reads a string VarInt length prefixed UTF-8 encoded string from the buffer.
   */
  public readString(): string {
    const len = this.readVarInt();
    if (len < 0 || len > 32767) throw new Error("Invalid length-prefix for string value");
    const bytes = this.readBytes(len);
    return bytes.toString("utf-8");
  }

  /**
   * Reads an unsigned 16 bit integer.
   */
  public readUShort(): number {
    // Slightly faster than readBytes(2).readUInt16BE()
    return ((this.readByte() & 0xff) << 8) | (this.readByte() & 0xff);
  }

  /**
   * Appends a byte (signed) to the buffer.
   * @param byte the byte to append
   */
  public writeByte(byte: number): this {
    if (this.buffer.length - this.writeOffset - 1 < EXPAND_THRESHOLD) this.buffer = Buffer.concat([this.buffer, Buffer.alloc(ALLOC_SIZE)]);
    this.buffer.writeInt8(byte, this.writeOffset++);
    return this;
  }

  /**
   * Appends many bytes to the buffer.
   * @param bytes the bytes to append
   */
  public writeBytes(bytes: Buffer): this {
    if (this.buffer.length - this.writeOffset - bytes.length < EXPAND_THRESHOLD) {
      this.buffer = Buffer.concat([this.buffer, bytes, Buffer.alloc(ALLOC_SIZE)]);
    } else {
      bytes.copy(this.buffer, this.writeOffset);
    }
    this.writeOffset += bytes.length;
    return this;
  }

  // TODO: Finish implementation
}
