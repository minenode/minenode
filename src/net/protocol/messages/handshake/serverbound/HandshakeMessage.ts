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
import { MessageHandler } from "../../../../../net/protocol/Message";
import { ConnectionState } from "../../../../../server/Connection";
import Server from "../../../../../server/Server";
import { Player } from "../../../../../world/Player";

export class HandshakeMessageHandler extends MessageHandler {
  public constructor(server: Server) {
    super({
      state: ConnectionState.HANDSHAKE,
      id: 0x00,
      label: "handshake",
      server,
    });
  }

  public async handle(buffer: MineBuffer, player: Player): Promise<void> {
    const protocolVersion = buffer.readVarInt();
    const serverAddress = buffer.readString();
    const serverPort = buffer.readUShort();
    const nextState = buffer.readVarInt();

    if (nextState !== ConnectionState.STATUS && nextState !== ConnectionState.LOGIN) {
      this.server.logger.error(`${player.connection.remote}: Invalid nextState: ${nextState}. Disconnecting.`);
      player.connection.hardDisconnect();
      return;
    }

    player.connection.clientProtocol = protocolVersion;

    await player.setState(nextState);

    const serverIP = `${serverAddress}:${serverPort}`;

    this.server.logger.debug(`${player.connection.remote}: handshake (server = ${serverIP}, protocol = ${protocolVersion}, nextState = ${nextState})`);
  }
}

export const selfRegisterMessageHandler = (server: Server) => new HandshakeMessageHandler(server);
