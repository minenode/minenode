// PlayClientboundJoinGameMessage.ts - creates Player Join Game messages
// Copyright (C) 2021 MineNode
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published
// by the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import { MineBuffer } from "../../../../../../native/index";
import { Encodable, encodeNBT } from "../../../../../data/NBT";
import { IClientboundMessage } from "../../../../../net/protocol/Message";
import { GameMode } from "../../../../../utils/Enums";

export interface PlayClientboundJoinGameMessageOptions {
  entityId: number;
  isHardcore: boolean;
  gamemode: GameMode;
  previousGameMode: GameMode;
  worlds: string[]; // TODO: identifier type (lowercase/:)
  dimensionCodec: Encodable;
  dimension: Encodable;
  worldName: string; // TODO: identifier type (lowercase/:)
  hashedSeed: bigint;
  maxPlayers: number;
  viewDistance: number;
  simulationDistance: number;
  reducedDebugInfo: boolean;
  enableRespawnScreen: boolean;
  isDebug: boolean;
  isFlat: boolean;
}

export class PlayClientboundJoinGameMessage implements IClientboundMessage {
  public id = 0x26;

  public entityId: number;
  public isHardcore: boolean;
  public gamemode: GameMode;
  public previousGameMode: GameMode;
  public worlds: string[]; // TODO: identifier type (lowercase/:)
  public dimensionCodec: Encodable;
  public dimension: Encodable;
  public worldName: string; // TODO: identifier type (lowercase/:)
  public hashedSeed: bigint;
  public maxPlayers: number;
  public viewDistance: number;
  public simulationDistance: number;
  public reducedDebugInfo: boolean;
  public enableRespawnScreen: boolean;
  public isDebug: boolean;
  public isFlat: boolean;

  public constructor(options: PlayClientboundJoinGameMessageOptions) {
    this.entityId = options.entityId;
    this.isHardcore = options.isHardcore;
    this.gamemode = options.gamemode;
    this.previousGameMode = options.previousGameMode;
    this.worlds = options.worlds;
    this.dimensionCodec = options.dimensionCodec;
    this.dimension = options.dimension;
    this.worldName = options.worldName;
    this.hashedSeed = options.hashedSeed;
    this.maxPlayers = options.maxPlayers;
    this.viewDistance = options.viewDistance;
    this.simulationDistance = options.simulationDistance;
    this.reducedDebugInfo = options.reducedDebugInfo;
    this.enableRespawnScreen = options.enableRespawnScreen;
    this.isDebug = options.isDebug;
    this.isFlat = options.isFlat;
  }

  public encode(buffer: MineBuffer): void {
    buffer.writeInt(this.entityId);
    buffer.writeBoolean(this.isHardcore);
    buffer.writeUByte(this.gamemode);
    buffer.writeByte(this.previousGameMode);
    buffer.writeVarInt(this.worlds.length);

    for (const world of this.worlds) {
      buffer.writeString(world);
    }

    // buffer.writeNBT(this.dimensionCodec, { name: "" });
    // buffer.writeNBT(this.dimension, { name: "" });
    encodeNBT(buffer, this.dimensionCodec, { name: "" });
    encodeNBT(buffer, this.dimension, { name: "" });
    buffer.writeString(this.worldName);
    buffer.writeLong(this.hashedSeed);
    buffer.writeVarInt(this.maxPlayers);
    buffer.writeVarInt(this.viewDistance);
    buffer.writeVarInt(this.simulationDistance);
    buffer.writeBoolean(this.reducedDebugInfo);
    buffer.writeBoolean(this.enableRespawnScreen);
    buffer.writeBoolean(this.isDebug);
    buffer.writeBoolean(this.isFlat);
  }
}
