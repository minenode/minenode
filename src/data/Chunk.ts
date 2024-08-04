/* eslint-disable license-header/header */
import MinecraftData from "minecraft-data";
import { BiomeSection } from "./BiomeSection";
import { BitArray } from "./BitArray";
import { Block } from "./Block";
import { ChunkSection } from "./ChunkSection";
import { getLightSectionIndex, getSectionBlockIndex, toBiomePos, toSectionPos } from "./Utils";
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
          singleValue: 0, // air block
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
      value: 1,
    });

    this.skyLightSections = [];

    this.blockLightMask = new BitArray({
      bitsPerValue: 1,
      capacity: this.numSections + 2,
    });
    this.emptyBlockLightMask = new BitArray({
      bitsPerValue: 1,
      capacity: this.numSections + 2,
      value: 1,
    });

    this.blockLightSections = [];
  }

  public setBlock(pos: Vec3, block: Block) {
    if (typeof block.stateId !== "undefined") {
      this.setBlockStateId(pos, block.stateId);
    }
    // if (typeof block.biomeId !== "undefined") {
    // this.setBiome(pos, block.biomeId);
    // }
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
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const stateId = mcData.blocks[id]?.minStateId;
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

  public getSkyLight(pos: Vec3): number {
    const sectionIndex = getLightSectionIndex(pos, this.minY);
    const section = this.skyLightSections[sectionIndex];
    if (section) {
      return section.get(getSectionBlockIndex(pos, this.minY));
    }
    return 0;
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
        capacity: 4096, // 16 * 16 * 16
      });
      this.skyLightMask.set(sectionIndex, 1);
      this.skyLightSections[sectionIndex] = section;
    }

    section.set(getSectionBlockIndex(pos, this.minY), light);
  }

  public setBiome(pos: Vec3, biomeId: number) {
    const biome = this.biomes[(pos.y - this.minY) >> 4];
    if (biome) {
      biome.set(toBiomePos(pos, this.minY), biomeId);
    }
  }

  public setBlockLight(pos: Vec3, light: number) {
    const sectionIndex = getLightSectionIndex(pos, this.minY);
    let section = this.blockLightSections[sectionIndex];

    if (section === null) {
      if (light === 0) {
        return;
      }
      section = new BitArray({
        bitsPerValue: 4,
        capacity: 4096,
      });
      if (sectionIndex > this.blockLightMask.capacity) {
        this.blockLightMask = this.blockLightMask.resize(sectionIndex);
      }
      this.blockLightMask.set(sectionIndex, 1);
      this.blockLightSections[sectionIndex] = section;
    }
    section.set(getSectionBlockIndex(pos, this.minY), light);
  }

  public renderSkyLight() {
    const queue: Vec3[] = [];

    for (let x = 0; x < 16; x++) {
      for (let z = 0; z < 16; z++) {
        for (let y = this.minY; y < this.minY + this.worldHeight; y++) {
          const pos = new Vec3(x, y, z);
          const light = this.getSkyLight(pos);
          if (light > 0) {
            queue.push(pos);
          }
        }
      }
    }

    while (queue.length > 0) {
      const pos = queue.shift()!;
      const currentLight = this.getSkyLight(pos);
      for (const neighbor of this.getNeighbors(pos)) {
        const neighborLight = this.getSkyLight(neighbor);
        if (neighborLight < currentLight - 1) {
          this.setSkyLight(neighbor, currentLight - 1);
          queue.push(neighbor);
        }
      }
    }
  }

  private getNeighbors(pos: Vec3): Vec3[] {
    return [
      new Vec3(pos.x + 1, pos.y, pos.z),
      new Vec3(pos.x - 1, pos.y, pos.z),
      new Vec3(pos.x, pos.y + 1, pos.z),
      new Vec3(pos.x, pos.y - 1, pos.z),
      new Vec3(pos.x, pos.y, pos.z + 1),
      new Vec3(pos.x, pos.y, pos.z - 1),
    ];
  }

  public updateLightMasks() {
    for (let i = 0; i < this.numSections; i++) {
      const section = this.skyLightSections[i];
      this.skyLightMask.set(i, section ? 1 : 0);
      this.emptySkyLightMask.set(i, section ? 0 : 1);

      const blockSection = this.blockLightSections[i];
      this.blockLightMask.set(i, blockSection ? 1 : 0);
      this.emptyBlockLightMask.set(i, blockSection ? 0 : 1);
    }
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

    buffer.writeVarInt(this.skyLightSections.length);
    this.skyLightSections.forEach((section, index) => {
      if (section && this.skyLightMask.get(index)) {
        buffer.writeVarInt(section.sizeInBytes());
        section.writeBuffer(buffer);
      }
    });
    buffer.writeVarInt(this.blockLightSections.length);

    this.blockLightSections.forEach((section, index) => {
      if (section && this.blockLightMask.get(index)) {
        buffer.writeVarInt(section.sizeInBytes());
        section.writeBuffer(buffer);
      }
    });
  }

  public dump(buffer: MineBuffer) {
    const tempBUF = new MineBuffer();
    for (let i = 0; i < this.numSections; ++i) {
      if (this.sections[i]) {
        this.sections[i]?.write(tempBUF);
        this.biomes[i]?.write(tempBUF);
      }
    }
    const buf = tempBUF.getBuffer();

    buffer.writeVarInt(buf.length);
    buffer.writeBytes(buf);
  }

  public toJson() {
    const sections = this.sections.map(section => (section ? section.toJson() : null));
    const biomes = this.biomes.map(biome => (biome ? biome.toJson() : null));
    return {
      minY: this.minY,
      worldHeight: this.worldHeight,
      sections,
      biomes,
    };
  }

  public static fromJson(data: ReturnType<Chunk["toJson"]>): Chunk {
    const chunk = new Chunk({
      minY: data.minY,
      worldHeight: data.worldHeight,
    });

    data.sections.forEach((sectionData, i) => {
      if (sectionData) {
        chunk.sections[i] = ChunkSection.fromJson(sectionData);
      }
    });

    data.biomes.forEach((biomeData, i) => {
      if (biomeData) {
        chunk.biomes[i] = BiomeSection.fromJson(biomeData);
      }
    });

    return chunk;
  }
}
