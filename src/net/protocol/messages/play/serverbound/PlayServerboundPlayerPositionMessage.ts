// PlayServerboundPlayerPositionMessage.ts - handle Player Position messages
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

import Server from "../../../../../server/Server";
import MineBuffer from "../../../../../utils/MineBuffer";
import Connection, { ConnectionState } from "../../../../../server/Connection";
import { MessageHandler } from "../../../../../net/protocol/Message";

export class PlayServerboundPlayerPositionMessage extends MessageHandler {
  public constructor(server: Server) {
    super({
      state: ConnectionState.PLAY,
      id: 0x11,
      label: "player position",
      server,
    });
  }

  public handle(buffer: MineBuffer, player: Connection): void {
    const x = buffer.readDouble();
    const y = buffer.readDouble();
    const z = buffer.readDouble();
    const onGround = buffer.readBoolean();

    this.server.logger.debug(`${player.remote}: player position (x = ${x}, y = ${y}, z = ${z}, onGround = ${onGround})`);
  }
}
