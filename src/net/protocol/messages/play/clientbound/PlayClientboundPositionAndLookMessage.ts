// PlayClientboundPositionAndLookMessage.ts - creates Player Position And Look messages
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
import { MineBuffer } from "../../../../../../native/index";
import { Vec5 } from "../../../../../utils/Geometry";

export interface PlayClientboundPositionAndLookMessageOptions {
  position: Vec5;
  flags: { x: boolean; y: boolean; z: boolean; y_rot: boolean; x_rot: boolean };
  teleportId: number;
  dismountVehicle: boolean;
}

export class PlayClientboundPositionAndLookMessage implements IClientboundMessage {
  public id = 0x38;

  public position: Vec5;
  public flags: { x: boolean; y: boolean; z: boolean; y_rot: boolean; x_rot: boolean };
  public teleportId: number;
  public dismountVehicle: boolean;

  public constructor(options: PlayClientboundPositionAndLookMessageOptions) {
    this.position = options.position;
    this.flags = options.flags;
    this.teleportId = options.teleportId;
    this.dismountVehicle = options.dismountVehicle;
  }

  public encode(buffer: MineBuffer): void {
    buffer.writeDouble(this.position.x);
    buffer.writeDouble(this.position.y);
    buffer.writeDouble(this.position.z);
    buffer.writeFloat(this.position.yaw);
    buffer.writeFloat(this.position.pitch);
    buffer.writeUByte(
      (this.flags.x ? 0x01 : 0) | (this.flags.y ? 0x02 : 0) | (this.flags.z ? 0x04 : 0) | (this.flags.y_rot ? 0x08 : 0) | (this.flags.x_rot ? 0x10 : 0),
    );
    buffer.writeVarInt(this.teleportId);
    buffer.writeBoolean(this.dismountVehicle);
  }
}
