/* eslint-disable license-header/header */
import { BitArray } from "./BitArray";
import { neededBits } from "./Utils";
import { MineBuffer } from "../../native";
import { BLOCK_SECTION_VOLUME, MAX_BITS_PER_BLOCK, MIN_BITS_PER_BLOCK, GLOBAL_BITS_PER_BLOCK } from "../utils/Constants";

export interface PaletteBase {
  value: number;
  bitsPerValue: number;
  capacity: number;
  maxBits: number;
  maxBitsPerBlock: number;
  palette?: Array<number>;
  data?: BitArray;

  get(index: number): number;
  set(index: number, value: number): PaletteBase;
  write(buffer: MineBuffer): void;
  toJson(): JsonPalette;
}

interface SingleValueContainerConfig {
  value?: number;
  bitsPerValue?: number;
  capacity?: number;
  maxBits?: number;
  maxBitsPerBlock?: number;
}

interface IndirectPaletteContainerConfig {
  data?: BitArray;
  bitsPerValue?: number;
  capacity?: number;
  palette?: Array<number>;
  maxBits?: number;
  maxBitsPerBlock?: number;
}

export interface JsonPalette extends SingleValueContainerConfig, Omit<IndirectPaletteContainerConfig, "data"> {
  type: string;
  data?: ReturnType<BitArray["toJson"]>;
}

class DirectPaletteContainer implements PaletteBase {
  public value: number;
  public bitsPerValue: number;
  public capacity: number;
  public maxBits: number;
  public maxBitsPerBlock: number;
  public palette: Array<number>;
  public data: BitArray;

  public constructor(options: IndirectPaletteContainerConfig) {
    this.data = new BitArray({
      bitsPerValue: options.bitsPerValue ?? GLOBAL_BITS_PER_BLOCK,
      capacity: options.capacity ?? BLOCK_SECTION_VOLUME,
    });

    // unusedW
    this.palette = [];
    // eslint-disable-next-line no-multi-assign
    this.value = this.bitsPerValue = this.capacity = this.maxBits = this.maxBitsPerBlock = 0;
  }

  public get(index: number) {
    return this.data.get(index);
  }

  public set(index: number, value: number) {
    this.data.set(index, value);
    return this;
  }

  public write(buffer: MineBuffer) {
    // buffer.writeUByte(this.data.bitsPerValue);
    buffer.writeVarInt(this.data.size());
    this.data.writeBuffer(buffer);
  }

  public toJson(): JsonPalette {
    return {
      type: "drc",
      bitsPerValue: this.data.bitsPerValue,
      capacity: this.data.capacity,
    };
  }
}

export class IndirectPaletteContainer implements PaletteBase {
  public value: number;
  public bitsPerValue: number;
  public capacity: number;
  public maxBits: number;
  public maxBitsPerBlock: number;
  public palette: Array<number>;
  public data: BitArray;

  public constructor(options: IndirectPaletteContainerConfig) {
    this.data =
      options.data ??
      new BitArray({
        bitsPerValue: options.bitsPerValue ?? MIN_BITS_PER_BLOCK,
        capacity: options.capacity ?? BLOCK_SECTION_VOLUME,
      });

    this.palette = options.palette ?? [0];
    this.maxBits = options.maxBits ?? MAX_BITS_PER_BLOCK;
    this.maxBitsPerBlock = options.maxBitsPerBlock ?? MAX_BITS_PER_BLOCK;

    // eslint-disable-next-line no-multi-assign
    this.value = this.bitsPerValue = this.capacity = 0;
  }

  public get(index: number) {
    return this.palette[this.data.get(index)];
  }

  public set(index: number, value: number): PaletteBase {
    let paletteIndex = this.palette.indexOf(value);
    if (paletteIndex < 0) {
      paletteIndex = this.palette.length;
      this.palette.push(value);
      const bitsPerValue = neededBits(paletteIndex);
      if (bitsPerValue > this.data.bitsPerValue) {
        if (bitsPerValue <= this.maxBits) {
          this.data = this.data.resizeTo(bitsPerValue);
        } else {
          return this.convertToDirect(this.maxBitsPerBlock).set(index, value);
        }
      }
    }
    this.data.set(index, paletteIndex);
    return this;
  }

  protected convertToDirect(bitsPerValue?: number): PaletteBase {
    const direct = new DirectPaletteContainer({
      bitsPerValue: bitsPerValue ?? GLOBAL_BITS_PER_BLOCK,
      capacity: this.data.capacity,
    });
    for (let i = 0; i < this.data.capacity; ++i) {
      direct.data.set(i, this.get(i));
    }
    return direct;
  }

  public write(buffer: MineBuffer) {
    buffer.writeUByte(this.data.bitsPerValue);
    buffer.writeVarInt(this.palette.length);
    for (const paletteElement of this.palette) {
      buffer.writeVarInt(paletteElement);
    }
    buffer.writeVarInt(this.data.size());
    this.data.writeBuffer(buffer);
  }

  public toJson(): JsonPalette {
    return {
      type: "ind",
      bitsPerValue: this.data.bitsPerValue,
      capacity: this.data.capacity,
      palette: this.palette,
      data: this.data.toJson(),
    };
  }
}

export class SingleValueContainer implements PaletteBase {
  public value: number;
  public bitsPerValue: number;
  public capacity: number;
  public maxBits: number;
  public maxBitsPerBlock: number;
  public palette?: Array<number>;
  public data?: BitArray;

  public constructor(options: SingleValueContainerConfig) {
    this.value = options.value ?? 0;
    this.bitsPerValue = options.bitsPerValue ?? MIN_BITS_PER_BLOCK;
    this.capacity = options.capacity ?? BLOCK_SECTION_VOLUME;
    this.maxBits = options.maxBits ?? MAX_BITS_PER_BLOCK;
    this.maxBitsPerBlock = options.maxBitsPerBlock ?? MAX_BITS_PER_BLOCK;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public get(_index: number) {
    return this.value;
  }

  public set(index: number, value: number) {
    if (value === this.value) {
      return this;
    }

    const data = new BitArray({
      bitsPerValue: this.bitsPerValue,
      capacity: this.capacity,
    });
    data.set(index, 1);

    return new IndirectPaletteContainer({
      data,
      palette: [this.value, value],
      capacity: this.capacity,
      bitsPerValue: this.bitsPerValue,
      maxBits: this.maxBits,
      maxBitsPerBlock: this.maxBitsPerBlock,
    });
  }

  public write(buffer: MineBuffer) {
    buffer.writeUByte(0);
    buffer.writeVarInt(this.value);
    buffer.writeByte(0);
  }

  public toJson(): JsonPalette {
    return {
      type: "sig",
      value: this.value,
      bitsPerValue: this.bitsPerValue,
      capacity: this.capacity,
    };
  }
}

export const palletFromJSON = (json: JsonPalette): PaletteBase => {
  // console.log(json);
  const { data, ...rest } = json;
  const palette = data ? { ...rest, data: BitArray.from(data) } : rest;
  switch (json.type) {
    case "drc":
      return new DirectPaletteContainer(palette);
    case "ind":
      return new IndirectPaletteContainer(palette);
    case "sig":
      return new SingleValueContainer(json);
    default:
      throw new Error(`Unknown palette type ${json.type}`);
  }
};
