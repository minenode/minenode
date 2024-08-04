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
}

export class PlayClientboundChunkDataMessage implements IClientboundMessage {
  public id = 0x22;

  public chunkLocation: Vec2;
  public heightMap: { MOTION_BLOCKING: bigint[]; WORLD_SURFACE?: bigint[] };
  public data: Chunk;
  // TODO: public blockEntities: BlockEntity[];
  public trustEdges: boolean;

  public constructor(options: PlayClientboundChunkDataMessageOptions) {
    this.chunkLocation = options.chunkLocation;
    this.heightMap = options.heightMap;
    this.data = options.data;
    this.trustEdges = options.trustEdges;
  }

  public encode(buffer: MineBuffer): void {
    buffer.writeInt(this.chunkLocation.x);
    buffer.writeInt(this.chunkLocation.y);
    encodeNBT(buffer, this.heightMap, { name: "" });
    this.data.dump(buffer);
    buffer.writeVarInt(0); // TODO: blockEntities
    buffer.writeBoolean(this.trustEdges);
    for (let i = 0; i < 6; i++) {
      // TODO: send light data from Update Light packet
      buffer.writeVarInt(0); // TODO: Sky Light Mask | Block Light Mask | Empty Sky Light Mask | Empty Block Light Mask | Sky Light array count | Block Light array count
    }
  }
}
