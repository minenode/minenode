// MessageHandlerFactory.ts - handles incoming messages
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

import Server from "../../../server/Server";
import { MessageHandler } from "../Message";
import { ConnectionState } from "../../../server/Connection";

import { HandshakeMessageHandler } from "./handshake/serverbound/HandshakeMessage";
import { StatusPingMessageHandler } from "./status/serverbound/StatusPingMessage";
import { StatusRequestMessageHandler } from "./status/serverbound/StatusRequestMessage";
import { LoginStartMessage } from "./login/serverbound/LoginStartMessage";
import { LoginEncryptionResponseMessage } from "./login/serverbound/LoginEncryptionResponseMessage";

export default class MessageHandlerFactory {
  public readonly registered: Set<MessageHandler> = new Set();

  public constructor(public readonly server: Server) {
    this.registered
      .add(new HandshakeMessageHandler(this.server))
      .add(new StatusPingMessageHandler(this.server))
      .add(new StatusRequestMessageHandler(this.server))
      .add(new LoginEncryptionResponseMessage(this.server))
      .add(new LoginStartMessage(this.server));
  }

  public getHandler(id: number, state: ConnectionState): MessageHandler | null {
    for (const handler of this.registered) {
      if (handler.state === state && handler.id === id) return handler;
    }
    return null;
  }
}
