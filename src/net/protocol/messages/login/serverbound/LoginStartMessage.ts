// LoginStartMessage.ts - handle Login Start messages
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

import { MessageHandler } from "../../../../../net/protocol/Message";
import Server from "../../../../../server/Server";
import { ConnectionState } from "../../../../../server/Connection";
import MineBuffer from "../../../../../utils/MineBuffer";
import Connection from "../../../../../server/Connection";
import LoginEncryptionRequestMessage from "../clientbound/LoginEncryptionRequestMessage";
import { GAME_VERSION, PROTOCOL_VERSION } from "../../../../../utils/Constants";

export class LoginStartMessage extends MessageHandler {
  public constructor(server: Server) {
    super({
      state: ConnectionState.LOGIN,
      id: 0x00,
      label: "login start",
      server,
    });
  }

  public handle(buffer: MineBuffer, player: Connection): void {
    const username = buffer.readString();
    // TODO: validate username w/ regex
    player.username = username;

    this.server.logger.info(`${player.remote}: Login start for username '${username}'`);

    if (!player.clientProtocol) {
      return player.disconnect("Your client did not provide a protocol version.");
    } else if (player.clientProtocol < PROTOCOL_VERSION) {
      return player.disconnect(`Your client is outdated! Server is on version ${GAME_VERSION}.`);
    } else if (player.clientProtocol > PROTOCOL_VERSION) {
      return player.disconnect(`Your client is too new! Server is on version ${GAME_VERSION}.`);
    }

    const response = new LoginEncryptionRequestMessage({
      serverID: "",
      publicKey: this.server.keypair.publicKey.export({
        format: "der",
        type: "spki",
      }),
      verifyToken: player.encryption.verifyToken,
    });

    player.writeMessage(response);
  }
}
