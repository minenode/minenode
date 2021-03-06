// StatusRequestMessage.ts - handle status request messages
// Copyright (C) 2020 MineNode
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
import { MessageHandler } from "../../../Message";
import StatusResponseMessage from "../clientbound/StatusResponseMessage";
import { GAME_VERSION, PROTOCOL_VERSION } from "../../../../../utils/Constants";
import { formatChat } from "../../../../../utils/Chat";

export class StatusRequestMessageHandler extends MessageHandler {
  public constructor(server: Server) {
    super({
      state: ConnectionState.STATUS,
      id: 0x00,
      label: "status request",
      server: server,
    });
  }

  public handle(_buffer: MineBuffer, player: Connection): void {
    const response = new StatusResponseMessage({
      version: {
        name: GAME_VERSION,
        protocol: PROTOCOL_VERSION,
      },
      players: {
        max: this.server.options.maxPlayers,
        online: [...this.server.connections].filter(conn => conn.state === ConnectionState.PLAY).length, // TODO: this should be players, not connections
        sample: [], // TODO
      },
      description: formatChat(this.server.options.motd, "&"),
      favicon: this.server.encodedFavicon,
    });
    player.writeMessage(response);
    console.log(`[server/DEBUG] ${player.remote}: status request`);
  }
}
