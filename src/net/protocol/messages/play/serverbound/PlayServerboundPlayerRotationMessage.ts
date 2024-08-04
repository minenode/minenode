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

import { MineBuffer } from "../../../../../../native";
import { ConnectionState } from "../../../../../server/Connection";
import Server from "../../../../../server/Server";
import { Vec5 } from "../../../../../utils/Geometry";
import { Player } from "../../../../../world/Player";
import { MessageHandler } from "../../../Message";

export class PlayServerboundPlayerRotationMessage extends MessageHandler {
  public constructor(server: Server) {
    super({
      state: ConnectionState.PLAY,
      id: 0x13,
      label: "player rotation",
      server,
    });
  }

  public async handle(buffer: MineBuffer, player: Player): Promise<void> {
    const yaw = buffer.readFloat();
    const pitch = buffer.readFloat();
    const onGround = buffer.readBoolean();

    const newPos = new Vec5(player.position.x, player.position.y, player.position.z, yaw, pitch);

    await player.setPositionChecked(newPos, onGround);
  }
}

export const selfRegisterMessageHandler = (server: Server) => new PlayServerboundPlayerRotationMessage(server);
