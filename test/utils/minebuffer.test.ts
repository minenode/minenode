import MineBuffer from "../../src/utils/minebuffer";
import * as Long from "long";
import * as uuid from "uuid";

const buffer = new MineBuffer();

test("readByte() out-of-bounds read error", () => {
  expect(() => buffer.readByte()).toThrowError();
});

test("read/write byte", () => {
  for (let i = -128; i < 128; i++) {
    expect(buffer.writeByte(i).readByte()).toEqual(i);
  }
});

test("read/write bytes", () => {
  const data = Buffer.alloc(0x2000);
  for (let i = 0; i < data.length; i++) data[i] = i % 0xff;
  for (let i = 0; i < 100; i++) {
    expect(buffer.writeBytes(data).readBytes(data.length).toString("hex")).toEqual(data.toString("hex"));
  }
});

test("read/write UByte", () => {
  for (let i = 0; i <= 0xff; i++) {
    expect(buffer.writeUByte(i).readUByte()).toEqual(i);
  }
});

test("read/write boolean", () => {
  expect(buffer.writeBoolean(true).readBoolean()).toEqual(true);
  expect(buffer.writeBoolean(false).readBoolean()).toEqual(false);
});

test("read/write int", () => {
  const cases = [-2147483648, -1, 0, 1, 2147483647];
  for (const i of cases) {
    expect(buffer.writeInt(i).readInt()).toEqual(i);
  }
});

test("read/write long", () => {
  const cases = ["-9223372036854775808", "-2147483648", "0", "2147483647", "9223372036854775807"].map(x => Long.fromString(x));
  for (const i of cases) {
    expect(buffer.writeLong(i).readLong().toString()).toEqual(i.toString());
  }
});

test("read/write float", () => {
  for (let i = -1000; i < 1000; i += 10.01) {
    expect(buffer.writeFloat(i).readFloat()).toBeCloseTo(i);
  }
});

buffer.reset();

test("read/write double", () => {
  for (let i = -1000; i < 1000; i += 10.01) {
    expect(buffer.writeDouble(i).readDouble()).toBeCloseTo(i);
  }
});

test("read/write VarInt", () => {
  for (let i = -32767; i < 32767; i += 32) {
    expect(buffer.writeVarInt(i).readVarInt()).toEqual(i);
  }
});

test("read/write VarLong", () => {
  const cases = ["-9223372036854775808", "-2147483648", "0", "2147483647", "9223372036854775807"].map(x => Long.fromString(x));
  for (const i of cases) {
    expect(buffer.writeVarLong(i).readVarLong()).toEqual(i);
  }
});

test("read/write string", () => {
  expect(buffer.writeString(".".repeat(32767)).readString().length).toEqual(32767);
});

test("read/write short", () => {
  for (let i = -32767; i < 32767; i += 32) {
    expect(buffer.writeShort(i).readShort()).toEqual(i);
  }
}, 3000);

test("read/write ushort", () => {
  for (let i = 0; i < 0x10000; i += 32) {
    expect(buffer.writeUShort(i).readUShort()).toEqual(i);
  }
});

test("read/write position", () => {
  for (let x = -5; x < 5; x++) {
    for (let y = -5; y < 5; y++) {
      for (let z = -5; z < 5; z++) {
        const pos = { x, y, z };
        expect(buffer.writePosition(pos).readPosition()).toMatchObject(pos);
      }
    }
  }
});

test("read/write UUID", () => {
  for (let i = 0; i < 10; i++) {
    const u = uuid.v4();
    expect(buffer.writeUUID(u).readUUID()).toEqual(u);
  }
});

test("read/write UByte", () => {
  for (let i = 0; i < 0x100; i++) {
    expect(buffer.writeUByte(i).readUByte()).toEqual(i);
  }
});
