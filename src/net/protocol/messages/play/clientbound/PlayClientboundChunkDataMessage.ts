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
import { encodeNBT } from "../../../../../data/NBT";
import { Vec2 } from "../../../../../utils/Geometry";
import { IClientboundMessage } from "../../../Message";

export interface PlayClientboundChunkDataMessageOptions {
  chunkLocation: Vec2;
  heightMap: { MOTION_BLOCKING: bigint[] };
  data: Uint8Array;
  // TODO:  blockEntities: BlockEntity[];
  trustEdges: boolean;
  skyLightMask: number; // TODO
  blockLightMask: number; // TODO
  emptySkyLightMask: number; // TODO
  skyLight: Uint8Array; // TODO - for now, fill with 2048 1's
  blockLight: Uint8Array; // TODO - for now, fill with 2048 1's
}

export class PlayClientboundChunkDataMessage implements IClientboundMessage {
  public id = 0x22;

  public chunkLocation: Vec2;
  public heightMap: { MOTION_BLOCKING: bigint[] };
  public data: Uint8Array;
  // TODO: public blockEntities: BlockEntity[];
  public trustEdges: boolean;
  public skyLightMask: number; // TODO
  public blockLightMask: number; // TODO
  public emptySkyLightMask: number; // TODO
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
    this.skyLight = options.skyLight;
    this.blockLight = options.blockLight;
  }

  public encode(buffer: MineBuffer): void {
    buffer.writeInt(this.chunkLocation.x);
    buffer.writeInt(this.chunkLocation.y);
    // buffer.writeNBT(this.heightMap);
    encodeNBT(buffer, this.heightMap);
    buffer.writeVarInt(this.data.length);
    buffer.writeBytes(Buffer.from(this.data));
    buffer.writeVarInt(0); // TODO: blockEntities
    buffer.writeBoolean(this.trustEdges);
    buffer.writeUByte(this.skyLightMask);
    buffer.writeUByte(this.blockLightMask);
    buffer.writeUByte(this.emptySkyLightMask);
    buffer.writeVarInt(this.skyLight.length);
    buffer.writeBytes(Buffer.from(this.skyLight));
    buffer.writeVarInt(this.blockLight.length);
    buffer.writeBytes(Buffer.from(this.blockLight));
  }
}
