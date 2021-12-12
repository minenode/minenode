// HandshakeMessage.ts - handle handshake messages
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

import Server from "/server/Server";
import MineBuffer from "/utils/MineBuffer";
import Connection, { ConnectionState } from "/server/Connection";
import { MessageHandler } from "/net/protocol/Message";

export class HandshakeMessageHandler extends MessageHandler {
  public constructor(server: Server) {
    super({
      state: ConnectionState.HANDSHAKE,
      id: 0x00,
      label: "handshake",
      server,
    });
  }

  public handle(buffer: MineBuffer, player: Connection): void {
    const protocolVersion = buffer.readVarInt();
    const serverAddress = buffer.readString();
    const serverPort = buffer.readUShort();
    const nextState = buffer.readVarInt();

    if (nextState !== ConnectionState.STATUS && nextState !== ConnectionState.LOGIN) {
      this.server.logger.error(`${player.remote}: Invalid nextState: ${nextState}. Disconnecting.`);
      player.hardDisconnect();
      return;
    }

    player.clientProtocol = protocolVersion;
    player.state = nextState;

    const serverIP = `${serverAddress}:${serverPort}`;

    this.server.logger.debug(`${player.remote}: handshake (server = ${serverIP}, protocol = ${protocolVersion}, nextState = ${nextState})`);
  }
}
