import { BitArray } from "./BitArray";
import { ChunkSection } from "./ChunkSection";
// Adapted from:
// https://github.com/PrismarineJS/prismarine-chunk/blob/3e617d8e39ed9863c46fe99c296eef82fc9eabaa/src/pc/1.16/ChunkColumn.js
// License: MIT

export interface ChunkOptions {
  minY?: number;
  worldHeight?: number;
}

export class Chunk {
  public readonly minY: number;
  public readonly worldHeight: number;
  public readonly numSections: number;

  public sectionMask: BitArray;
  public sections: (ChunkSection | null)[];
  public biomes: number[];

  public skyLightMask: BitArray;
  public emptySkyLightMask: BitArray;
  public skyLightSections: unknown[];

  public blockLightMask: BitArray;
  public emptyBlockLightMask: BitArray;
  public blockLightSections: unknown[];

  public constructor(options: ChunkOptions = {}) {
    this.minY = options.minY ?? 0;
    this.worldHeight = options.worldHeight ?? 256;
    this.numSections = this.worldHeight >> 4;

    this.sectionMask = new BitArray({
      bitsPerValue: 1,
      capacity: this.numSections,
    });
    this.sections = Array(this.numSections).fill(null);
    this.biomes = Array(4 * 4 * (this.worldHeight >> 2)).fill(0);

    this.skyLightMask = new BitArray({
      bitsPerValue: 1,
      capacity: this.numSections + 2,
    });
    this.emptySkyLightMask = new BitArray({
      bitsPerValue: 1,
      capacity: this.numSections + 2,
    });
    this.skyLightSections = Array(this.numSections + 2).fill(null);

    this.blockLightMask = new BitArray({
      bitsPerValue: 1,
      capacity: this.numSections + 2,
    });
    this.emptyBlockLightMask = new BitArray({
      bitsPerValue: 1,
      capacity: this.numSections + 2,
    });
    this.blockLightSections = Array(this.numSections + 2).fill(null);
  }
}
