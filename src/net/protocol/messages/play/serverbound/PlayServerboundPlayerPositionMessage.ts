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

import { MineBuffer, Vec5 } from "../../../../../../native/index";
import { MessageHandler } from "../../../../../net/protocol/Message";
import { ConnectionState } from "../../../../../server/Connection";
import Server from "../../../../../server/Server";
import { Player } from "../../../../../world/Player";

export class PlayServerboundPlayerPositionMessage extends MessageHandler {
  public constructor(server: Server) {
    super({
      state: ConnectionState.PLAY,
      id: 0x11,
      label: "player position",
      server,
    });
  }

  public async handle(buffer: MineBuffer, player: Player): Promise<void> {
    const x = buffer.readDouble();
    const y = buffer.readDouble();
    const z = buffer.readDouble();
    const onGround = buffer.readBoolean();

    const newPos5 = new Vec5(x, y, z, player.position.yaw, player.position.pitch);

    await player.setPositionChecked(newPos5, onGround);

    // const distance = newPos.distance(player.position.toVec3());

    // if (distance > 10) {
    //   // player.disconnect(`Player moved too far (distance = ${distance})`);
    //   // return;
    // }

    // if (onGround) {
    //   player.onGround = true;
    //   player.lastPositionOnGround = newPos;
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
    //   player.lastPositionOnGround = newPos; // We don't know where we are, so assume we're on the ground
    //   player.lastTickOnGround = this.server.tickCount;
    // }

    // player.position.x = x;
    // player.position.y = y;
    // player.position.z = z;

    // // this.server.logger.debug(`${player.connection.remote}: player position (x = ${x}, y = ${y}, z = ${z}, onGround = ${onGround})`);
  }
}

export const selfRegisterMessageHandler = (server: Server) => new PlayServerboundPlayerPositionMessage(server);