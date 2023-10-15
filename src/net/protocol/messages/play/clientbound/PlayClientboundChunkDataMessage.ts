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

import { MineBuffer } from "../../../../../../native/index";
import { Chunk } from "../../../../../data/Chunk";
import { encodeNBT } from "../../../../../data/NBT";
import { Vec2 } from "../../../../../utils/Geometry";
import { IClientboundMessage } from "../../../Message";

export interface PlayClientboundChunkDataMessageOptions {
  chunkLocation: Vec2;
  heightMap: { MOTION_BLOCKING: bigint[]; WORLD_SURFACE?: bigint[] };
  data: Chunk;
  // TODO:  blockEntities: BlockEntity[];
  trustEdges: boolean;
  skyLightMask: number; // TODO
  blockLightMask: number; // TODO
  emptySkyLightMask: number; // TODO
  emptyBlockLightMask: number;
  skyLight: Uint8Array; // TODO - for now, fill with 2048 1's
  blockLight: Uint8Array; // TODO - for now, fill with 2048 1's
}

export class PlayClientboundChunkDataMessage implements IClientboundMessage {
  public id = 0x22;

  public chunkLocation: Vec2;
  public heightMap: { MOTION_BLOCKING: bigint[]; WORLD_SURFACE?: bigint[] };
  public data: Chunk;
  // TODO: public blockEntities: BlockEntity[];
  public trustEdges: boolean;
  public skyLightMask: number; // TODO
  public blockLightMask: number; // TODO
  public emptySkyLightMask: number; // TODO
  public emptyBlockLightMask: number;
  public skyLight: Uint8Array; // TODO - for now, fill with 2048 1's
  public blockLight: Uint8Array; // TODO - for now, fill with 2048 1's

  public constructor(options: PlayClientboundChunkDataMessageOptions) {
    this.chunkLocation = options.chunkLocation;
    this.heightMap = options.heightMap;
    this.data = options.data;
    this.trustEdges = options.trustEdges;
    this.skyLightMask = options.skyLightMask;
    this.blockLightMask = options.blockLightMask;
    this.emptySkyLightMask = options.emptySkyLightMask;
    this.emptyBlockLightMask = options.emptyBlockLightMask;
    this.skyLight = options.skyLight;
    this.blockLight = options.blockLight;
  }

  /**
   * Chunk X                 | Int                  |  Chunk coordinate (block coordinate divided by 16, rounded down)
   * Chunk Z                 | Int                  |  Chunk coordinate (block coordinate divided by 16, rounded down)
   * Heightmaps              | NBT                  |  Compound containing one long array named MOTION_BLOCKING, which is a heightmap for the highest solid block at each position in the chunk (as a compacted long array with 256 entries, with the number of bits per entry varying depending on the world's height, defined by the formula ceil(log2(height + 1))). The Notchian server also adds a WORLD_SURFACE long array, the purpose of which is unknown, but it's not required for the chunk to be accepted.
   * Size                    | VarInt               |  Size of Data in bytes
   * Data                    | Byte array           |  See data structure in Chunk Format
   * N block ent             | VarInt               |  Number of elements in the following array //TODO: Ignored per hour
   * Trust Edges             | Boolean              |  If edges should be trusted for light updates.
   * Sky Light Mask          | BitSet               |  BitSet containing bits for each section in the world + 2. Each set bit indicates that the corresponding 16×16×16 chunk section has data in the Sky Light array below. The least significant bit is for blocks 16 blocks to 1 block below the min world height (one section below the world), while the most significant bit covers blocks 1 to 16 blocks above the max world height (one section above the world).
   * Block Light Mask        | BitSet               |  BitSet containing bits for each section in the world + 2. Each set bit indicates that the corresponding 16×16×16 chunk section has data in the Block Light array below. The order of bits is the same as in Sky Light Mask.
   * Empty Sky Light Mask    | BitSet               |  BitSet containing bits for each section in the world + 2. Each set bit indicates that the corresponding 16×16×16 chunk section has all zeros for its Sky Light data. The order of bits is the same as in Sky Light Mask.
   * Empty Block Light Mask  | BitSet               |  BitSet containing bits for each section in the world + 2. Each set bit indicates that the corresponding 16×16×16 chunk section has all zeros for its Block Light data. The order of bits is the same as in Sky Light Mask.
   * Sky Light array count   | VarInt               |  Number of entries in the following array; should match the number of bits set in Sky Light Mask. Length of the following array in bytes (always 2048)
   * Sky Light arrays        | Array of 2048 bytes  |  There is 1 array for each bit set to true in the sky light mask, starting with the lowest value. Half a byte per light value. Indexed ((y<<8) | (z<<4) | x) / 2 If there's a remainder, masked 0xF0 else 0x0F.
   * Block Light array count | VarInt               |  Number of entries in the following array; should match the number of bits set in Block Light Mask.Length of the following array in bytes (always 2048)
   * Block Light arrays      | Array of 2048 bytes  |  There is 1 array for each bit set to true in the block light mask, starting with the lowest value. Half a byte per light value. Indexed ((y<<8) | (z<<4) | x) / 2 If there's a remainder, masked 0xF0 else 0x0F.
   */

  public encode(buffer: MineBuffer): void {
    buffer.writeInt(this.chunkLocation.x);
    buffer.writeInt(this.chunkLocation.y);
    encodeNBT(buffer, this.heightMap, { name: "" });
    this.data.dump(buffer);
    buffer.writeVarInt(0); // TODO: blockEntities
    buffer.writeBoolean(this.trustEdges);
    this.data.dumpLight(buffer);
  }
}
