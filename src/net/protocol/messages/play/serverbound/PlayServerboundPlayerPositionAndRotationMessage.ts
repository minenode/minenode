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
import { MessageHandler } from "../../../../../net/protocol/Message";
import { ConnectionState } from "../../../../../server/Connection";
import Server from "../../../../../server/Server";
import { Vec5 } from "../../../../../utils/Geometry";
import { Player } from "../../../../../world/Player";

export class PlayServerboundPlayerPositionAndRotationMessage extends MessageHandler {
  public constructor(server: Server) {
    super({
      state: ConnectionState.PLAY,
      id: 0x12,
      label: "player position and rotation",
      server,
    });
  }

  public async handle(buffer: MineBuffer, player: Player): Promise<void> {
    const x = buffer.readDouble();
    const y = buffer.readDouble();
    const z = buffer.readDouble();
    const yaw = buffer.readFloat();
    const pitch = buffer.readFloat();
    const onGround = buffer.readBoolean();

    const newPos = new Vec5(x, y, z, yaw, pitch);

    await player.setPositionChecked(newPos, onGround);

    // const distance = newPos.distance(player.position);
    // if (distance > 10) {
    //   // TODO: anti-cheat etc.
    //   // player.disconnect(`Player moved too far (distance = ${distance})`);
    //   // return;
    // }

    // if (onGround) {
    //   player.onGround = true;
    //   player.lastPositionOnGround = newPos.toVec3();
    //   player.lastTickOnGround = this.server.tickCount;
    // } else if (player.lastPositionOnGround && player.lastTickOnGround) {
    //   player.onGround = false;
    //   // const distanceFloating = newPos.distance(player.lastPositionOnGround);
    //   // TODO: anti-cheat etc.
    //   const timeFloating = this.server.tickCount - player.lastTickOnGround;
    //   if (timeFloating > 20 * 10) {
    //     // player.disconnect("Flying is not enabled on this server.");
    //     // return;
    //   }
    // } else {
    //   player.onGround = false;
    //   player.lastPositionOnGround = newPos.toVec3(); // We don't know where we are, so assume we're on the ground
    //   player.lastTickOnGround = this.server.tickCount;
    // }

    // player.position.x = x;
    // player.position.y = y;
    // player.position.z = z;
    // player.position.yaw = yaw;
    // player.position.pitch = pitch;

    // // this.server.logger.debug(`${player.connection.remote}: player position and rotation ${pos} (onGround = ${onGround})`);
  }
}

export const selfRegisterMessageHandler = (server: Server) => new PlayServerboundPlayerPositionAndRotationMessage(server);