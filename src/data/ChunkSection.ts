/* eslint-disable license-header/header */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class

import { PaletteBase, palletFromJSON, SingleValueContainer } from "./Palette";
import { getBlockIndex } from "./Utils";
import { MineBuffer, Vec3 } from "../../native";
import { BLOCK_SECTION_VOLUME, GLOBAL_BITS_PER_BLOCK, MAX_BITS_PER_BLOCK, MIN_BITS_PER_BLOCK } from "../utils/Constants";

export interface ChunkSessionConfig {
  bitsPerBlock?: number;
  solidBlockCount?: number;
  data?: PaletteBase;
  palette?: Array<number> | null;
  singleValue?: number;
  maxBitsPerBlock?: number;
}

export class ChunkSection {
  public data: PaletteBase;
  public singleValue?: number;
  public solidBlockCount: number;
  public palette?: Array<number>;

  public constructor(options: ChunkSessionConfig) {
    if (options.data) {
      this.data = options.data;
      this.solidBlockCount = options.solidBlockCount ?? 0;

      if (!options.solidBlockCount) {
        for (let i = 0; i < BLOCK_SECTION_VOLUME; ++i) {
          if (this.data.get(i)) {
            this.solidBlockCount++;
          }
        }
      }
    } else {
      const value = options.singleValue ?? 0;

      this.data = new SingleValueContainer({
        value,
        bitsPerValue: MIN_BITS_PER_BLOCK,
        capacity: BLOCK_SECTION_VOLUME,
        maxBits: MAX_BITS_PER_BLOCK,
        maxBitsPerBlock: options.maxBitsPerBlock ?? GLOBAL_BITS_PER_BLOCK,
      });
      this.solidBlockCount = value ? BLOCK_SECTION_VOLUME : 0;
    }
    this.palette = this.data.palette;
  }

  public get(pos: Vec3) {
    return this.data.get(getBlockIndex(pos));
  }

  public set(pos: Vec3, stateId: number) {
    const blockIndex = getBlockIndex(pos);

    const oldBlock = this.get(pos);
    if (stateId === 0 && oldBlock !== 0) {
      this.solidBlockCount -= 1;
    } else if (stateId !== 0 && oldBlock === 0) {
      this.solidBlockCount += 1;
    }

    this.data = this.data.set(blockIndex, stateId);
    this.palette = this.data.palette;
  }

  public isEmpty() {
    return this.solidBlockCount === 0;
  }

  public write(buffer: MineBuffer) {
    buffer.writeShort(this.solidBlockCount);
    this.data.write(buffer);
  }

  public toJson() {
    return {
      solidBlockCount: this.solidBlockCount,
      palette: this.palette,
      data: this.data.toJson(),
    };
  }

  public static fromJson(data: ReturnType<ChunkSection["toJson"]>): ChunkSection {
    return new ChunkSection({
      solidBlockCount: data.solidBlockCount,
      data: palletFromJSON(data.data),
      palette: data.palette,
    });
  }
}
