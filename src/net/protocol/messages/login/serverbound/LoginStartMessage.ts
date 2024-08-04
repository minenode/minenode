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
import { GAME_VERSION, PROTOCOL_VERSION } from "../../../../../utils/Constants";
import { Player } from "../../../../../world/Player";
import LoginEncryptionRequestMessage from "../clientbound/LoginEncryptionRequestMessage";

export class LoginStartMessage extends MessageHandler {
  public constructor(server: Server) {
    super({
      state: ConnectionState.LOGIN,
      id: 0x00,
      label: "login start",
      server,
    });
  }

  public async handle(buffer: MineBuffer, player: Player): Promise<void> {
    const username = buffer.readString();

    if (!/^[a-zA-Z0-9_]{2,16}$/.test(username)) {
      await player.disconnect("Invalid username");
      return;
    }

    player.username = username;

    this.server.logger.info(`${player.connection.remote}: Login start for username '${username}'`);

    if (!player.connection.clientProtocol) {
      return player.disconnect("Your client did not provide a protocol version.");
    } else if (player.connection.clientProtocol < PROTOCOL_VERSION) {
      return player.disconnect(`Your client is outdated! Server is on version ${GAME_VERSION}.`);
    } else if (player.connection.clientProtocol > PROTOCOL_VERSION) {
      return player.disconnect(`Your client is too new! Server is on version ${GAME_VERSION}.`);
    }

    const response = new LoginEncryptionRequestMessage({
      serverID: "",
      publicKey: this.server.keypair.publicKey.export({
        format: "der",
        type: "spki",
      }),
      verifyToken: player.connection.encryption.verifyToken,
    });

    await player.connection.writeMessage(response);
  }
}

export const selfRegisterMessageHandler = (server: Server) => new LoginStartMessage(server);