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

import { IClientboundMessage } from "../../../../../net/protocol/Message";
import MineBuffer from "../../../../../utils/MineBuffer";
import { GameMode } from "../../../../../utils/DataTypes";
import { Encodable, Encoder } from "../../../../../data/NBT";

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
    buffer
      .writeInt(this.entityId)
      .writeBoolean(this.isHardcore)
      .writeUByte(this.gamemode)
      .writeByte(this.previousGameMode) //
      .writeVarInt(this.worlds.length);

    for (const world of this.worlds) {
      buffer.writeString(world);
    }

    buffer
      .writeBytes(new Encoder().encode(this.dimensionCodec, { name: "" }).buffer.getBuffer())
      .writeBytes(new Encoder().encode(this.dimension, { name: "" }).buffer.getBuffer())
      .writeString(this.worldName)
      .writeLong(this.hashedSeed)
      .writeVarInt(this.maxPlayers)
      .writeVarInt(this.viewDistance)
      .writeVarInt(this.simulationDistance)
      .writeBoolean(this.reducedDebugInfo)
      .writeBoolean(this.enableRespawnScreen)
      .writeBoolean(this.isDebug)
      .writeBoolean(this.isFlat);
  }
}
