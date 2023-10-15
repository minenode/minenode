/* eslint-disable license-header/header */
import MinecraftData from "minecraft-data";
import { BiomeSection } from "./BiomeSection";
import { BitArray } from "./BitArray";
import { Block } from "./Block";
import { ChunkSection } from "./ChunkSection";
import { getLightSectionIndex, getSectionBlockIndex, toSectionPos } from "./Utils";
import { MineBuffer, Vec3 } from "../../native";
import { GAME_VERSION } from "../utils/Constants";

export const mcData = MinecraftData(GAME_VERSION);
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
  public biomes: (BiomeSection | null)[];

  public skyLightMask: BitArray;
  public emptySkyLightMask: BitArray;
  public skyLightSections: (BitArray | null)[];

  public blockLightMask: BitArray;
  public emptyBlockLightMask: BitArray;
  public blockLightSections: (BitArray | null)[];

  public constructor(options: ChunkOptions = {}) {
    this.minY = options.minY ?? 0;
    this.worldHeight = options.worldHeight ?? 256;
    this.numSections = this.worldHeight >> 4;

    this.sectionMask = new BitArray({
      bitsPerValue: 1,
      capacity: this.numSections,
    });

    this.sections = Array.from<ChunkSection>({
      length: this.numSections,
    }).map(
      () =>
        new ChunkSection({
          bitsPerBlock: 15,
        }),
    );
    this.biomes = Array.from<BiomeSection>({
      length: this.numSections,
    }).map(
      () =>
        new BiomeSection({
          singleValue: 0,
        }),
    );

    this.skyLightMask = new BitArray({
      bitsPerValue: 1,
      capacity: this.numSections + 2,
    });

    this.emptySkyLightMask = new BitArray({
      bitsPerValue: 1,
      capacity: this.numSections + 2,
    });

    this.skyLightSections = [];

    this.blockLightMask = new BitArray({
      bitsPerValue: 1,
      capacity: this.numSections + 2,
    });
    this.emptyBlockLightMask = new BitArray({
      bitsPerValue: 1,
      capacity: this.numSections + 2,
    });
    this.blockLightSections = [];
  }

  public setBlock(pos: Vec3, block: Block) {
    if (typeof block.stateId !== "undefined") {
      this.setBlockStateId(pos, block.stateId);
    }
    if (typeof block.biomeId !== "undefined") {
      // this.setBiome(pos, block.biomeId);
    }
    // if (typeof block.skyLight !== "undefined") {
    //   this.setSkyLight(pos, block.skyLight);
    // }
    // if (typeof block.light !== "undefined") {
    //   this.setBlockLight(pos, block.light);
    // }
    // TODO: assert here if setting a block that should have an associated block entity
    // if (block.entity) {
    //   this.setBlockEntity(pos, block.entity);
    // } else {
    //   this.removeBlockEntity(pos);
    // }
  }

  public setBlockType(pos: Vec3, id: number) {
    const stateId = mcData.blocks[id].minStateId;
    if (stateId) {
      this.setBlockStateId(pos, stateId);
    }
  }

  public setBlockStateId(pos: Vec3, stateId: number) {
    const section = this.sections[(pos.y - this.minY) >> 4];
    if (section) {
      section.set(toSectionPos(pos, this.minY), stateId);
    }
  }

  public setSkyLight(pos: Vec3, light: number) {
    const sectionIndex = getLightSectionIndex(pos, this.minY);
    let section = this.skyLightSections[sectionIndex];

    if (!section) {
      if (light === 0) {
        return;
      }
      section = new BitArray({
        bitsPerValue: 4,
        capacity: 4096,
      });
      this.skyLightMask.set(sectionIndex, 1);
      this.skyLightSections[sectionIndex] = section;
    }

    section.set(getSectionBlockIndex(pos, this.minY), light);
  }

  public setBlockLight(pos: Vec3, light: number) {
    const sectionIndex = getLightSectionIndex(pos, this.minY);
    let section = this.blockLightSections[sectionIndex];

    // eslint-disable-next-line no-eq-null
    if (section == null) {
      if (light === 0) {
        return;
      }
      section = new BitArray({
        bitsPerValue: 4,
        capacity: 4096,
      });
      if (sectionIndex > this.blockLightMask.capacity) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        this.blockLightMask = this.blockLightMask.resize(sectionIndex);
      }
      this.blockLightMask.set(sectionIndex, 1);
      this.blockLightSections[sectionIndex] = section;
    }

    section.set(getSectionBlockIndex(pos, this.minY), light);
  }

  public dump(buffer: MineBuffer) {
    const tempBUF = new MineBuffer();
    for (let i = 0; i < this.numSections; ++i) {
      if (this.sections[i]) {
        this.sections[i]?.write(tempBUF);
        this.biomes[i]?.write(tempBUF);
        // TODO: PALLET BIOMES Ignore
        // tempBUF.writeByte(0);
        // tempBUF.writeVarInt(1);
        // tempBUF.writeByte(0);
      }
    }
    const buf = tempBUF.getBuffer();

    buffer.writeVarInt(buf.length);
    buffer.writeBytes(buf);
  }

  public dumpLight(buffer: MineBuffer) {
    buffer.writeVarInt(this.skyLightMask.size());
    this.skyLightMask.writeBuffer(buffer);
    buffer.writeVarInt(this.blockLightMask.size());
    this.blockLightMask.writeBuffer(buffer);
    buffer.writeVarInt(this.emptySkyLightMask.size());
    this.emptySkyLightMask.writeBuffer(buffer);
    buffer.writeVarInt(this.emptyBlockLightMask.size());
    this.emptyBlockLightMask.writeBuffer(buffer);

    buffer.writeVarInt(0);
    // buffer.writeVarInt(this.skyLightSections.length);
    // this.skyLightSections.forEach((section, index) => {
    //   if (section !== null && this.skyLightMask.get(index)) {
    //     console.log(section.size());
    //     buffer.writeVarInt(section.size());
    //     section.writeBuffer(buffer);
    //   }
    // });
    buffer.writeVarInt(this.blockLightSections.length);
    this.blockLightSections.forEach((section, index) => {
      if (section !== null && this.blockLightMask.get(index)) {
        buffer.writeVarInt(2048);
        section.writeBuffer(buffer);
      }
    });
  }
}
