// StatusRequestMessage.ts - handle status request messages
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
import { MineBuffer } from "../../../../../../native/index";
import { ConnectionState } from "../../../../../server/Connection";
import { MessageHandler } from "../../../../../net/protocol/Message";
import StatusResponseMessage from "../clientbound/StatusResponseMessage";
import { GAME_VERSION, PROTOCOL_VERSION } from "../../../../../utils/Constants";
import { formatChat } from "../../../../../utils/Chat";
import { Player } from "../../../../../server/Player";

export class StatusRequestMessageHandler extends MessageHandler {
  public constructor(server: Server) {
    super({
      state: ConnectionState.STATUS,
      id: 0x00,
      label: "status request",
      server: server,
    });
  }

  public handle(_buffer: MineBuffer, player: Player): void {
    const response = new StatusResponseMessage({
      version: {
        name: GAME_VERSION,
        protocol: PROTOCOL_VERSION,
      },
      players: {
        max: this.server.options.maxPlayers,
        online: [...this.server.players].filter(player => player.connection.state === ConnectionState.PLAY).length,
        sample: [...this.server.players]
          .filter(player => player.connection.state === ConnectionState.PLAY)
          .map(player => ({ name: player.username, id: player.uuid })),
      },
      description: formatChat(this.server.options.motd, "&"),
      favicon: this.server.encodedFavicon,
    });
    player.sendPacket(response);
    this.server.logger.debug(`${player.connection.remote}: status request`);
  }
}
