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

import * as uuid from "uuid";

import { MineBuffer } from "../../native";
import { Vec3 } from "../../native/index";

const buffer = new MineBuffer();

test("readByte() out-of-bounds read error", () => {
  expect(() => buffer.readByte()).toThrowError();
});
buffer.reset();

test("read/write byte", () => {
  for (let i = -128; i < 128; i++) {
    buffer.writeByte(i);
    expect(buffer.readByte()).toBe(i);
  }
});
buffer.reset();

test("read/write bytes", () => {
  const data = Buffer.alloc(0x2000);
  for (let i = 0; i < data.length; i++) data[i] = i % 0xff;
  for (let i = 0; i < 100; i++) {
    buffer.writeBytes(data);
    expect(buffer.readBytes(data.length)).toEqual(data);
  }
});
buffer.reset();

test("read/write UByte", () => {
  for (let i = 0; i <= 0xff; i++) {
    buffer.writeUByte(i);
    expect(buffer.readUByte()).toBe(i);
  }
});
buffer.reset();

test("read/write boolean", () => {
  buffer.writeBoolean(true);
  expect(buffer.readBoolean()).toBe(true);
  buffer.writeBoolean(false);
  expect(buffer.readBoolean()).toBe(false);
});
buffer.reset();

test("read/write int", () => {
  const cases = [-2147483648, -1, 0, 1, 2147483647];
  for (const i of cases) {
    buffer.writeInt(i);
    expect(buffer.readInt()).toBe(i);
  }
});
buffer.reset();

test("read/write long", () => {
  const cases = [-9223372036854775808n, -2147483648n, 0n, 2147483647n, 9223372036854775807n];
  for (const i of cases) {
    buffer.writeLong(i);
    expect(buffer.readLong()).toBe(i);
  }
});
buffer.reset();

test("read/write float", () => {
  for (let i = -1000; i < 1000; i += 10.01) {
    buffer.writeFloat(i);
    expect(buffer.readFloat()).toBeCloseTo(i, 0.01);
  }
});
buffer.reset();

test("read/write double", () => {
  for (let i = -1000; i < 1000; i += 10.01) {
    buffer.writeDouble(i);
    expect(buffer.readDouble()).toBeCloseTo(i, 0.01);
  }
});
buffer.reset();

test("read/write VarInt", () => {
  for (let i = -32767; i < 32767; i += 32) {
    buffer.writeVarInt(i);
    expect(buffer.readVarInt()).toBe(i);
  }
});
buffer.reset();

test("read/write VarLong", () => {
  const cases = [-9223372036854775808n, -2147483648n, 0n, 2147483647n, 9223372036854775807n];
  for (const i of cases) {
    buffer.writeVarLong(i);
    expect(buffer.readVarLong()).toBe(i);
  }
});
buffer.reset();

test("read/write string", () => {
  const testString = Array(100)
    .fill(0)
    .map((_, i) => i.toString(36))
    .join("");
  buffer.writeString(testString);
  expect(buffer.readString()).toBe(testString);
});
buffer.reset();

test("read/write short", () => {
  for (let i = -32767; i < 32767; i += 32) {
    buffer.writeShort(i);
    expect(buffer.readShort()).toBe(i);
  }
});
buffer.reset();

test("read/write ushort", () => {
  for (let i = 0; i < 0x10000; i += 32) {
    buffer.writeUShort(i);
    expect(buffer.readUShort()).toBe(i);
  }
});
buffer.reset();

test("read/write position", () => {
  for (let x = -5; x < 5; x++) {
    for (let y = -5; y < 5; y++) {
      for (let z = -5; z < 5; z++) {
        buffer.writePosition(new Vec3(x, y, z));
        expect(buffer.readPosition().toString()).toMatch(new Vec3(x, y, z).toString());
      }
    }
  }
});
buffer.reset();
// TODO: fix this test

test("read/write UUID", () => {
  for (let i = 0; i < 10; i++) {
    const u = uuid.v4();
    buffer.writeUUID(u);
    expect(buffer.readUUID()).toBe(u);
  }
});
buffer.reset();

test("read/write UByte", () => {
  for (let i = 0; i < 0x100; i++) {
    buffer.writeUByte(i);
    expect(buffer.readUByte()).toBe(i);
  }
});
buffer.reset();
