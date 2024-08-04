/* eslint-disable license-header/header */
import { PaletteBase, palletFromJSON, SingleValueContainer } from "./Palette";
import { getBiomeIndex } from "./Utils";
import { MineBuffer, Vec3 } from "../../native";
import { BIOME_SECTION_VOLUME, MAX_BITS_PER_BIOME, MIN_BITS_PER_BIOME } from "../utils/Constants";

export interface BiomeSectionOptions {
  data?: PaletteBase;
  singleValue?: number;
}

export class BiomeSection {
  public data: PaletteBase;
  public constructor(options: BiomeSectionOptions) {
    this.data =
      options.data ??
      new SingleValueContainer({
        value: options.singleValue ?? 0,
        bitsPerValue: MIN_BITS_PER_BIOME,
        capacity: BIOME_SECTION_VOLUME,
        maxBits: MAX_BITS_PER_BIOME,
      });
  }

  public get(pos: Vec3) {
    return this.data.get(getBiomeIndex(pos));
  }

  public set(pos: Vec3, biomeId: number) {
    this.data = this.data.set(getBiomeIndex(pos), biomeId);
  }

  public write(buffer: MineBuffer) {
    this.data.write(buffer);
  }

  public toJson() {
    return this.data.toJson();
  }

  public static fromJson(data: ReturnType<BiomeSection["toJson"]>): BiomeSection {
    return new BiomeSection({
      data: palletFromJSON(data),
    });
  }
}
