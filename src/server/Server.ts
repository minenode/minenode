// Server.ts - Main server interfaces and classes
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

import { EventEmitter } from "eventemitter3";

import * as net from "net";
import Connection from "../net/Connection";
import { HandshakeMessageHandler } from "../net/protocol/HandshakeMessage";
import { MessageHandler } from "../net/protocol/Message";
import { StatusPingMessageHandler } from "../net/protocol/StatusPingMessage";
import { StatusRequestMessageHandler } from "../net/protocol/StatusRequestMessage";

export default class Server extends EventEmitter {
  public tcpServer: net.Server = new net.Server();
  public connections: Set<Connection> = new Set();
  public handlers: Set<MessageHandler> = new Set();

  public constructor() {
    super();

    // Bind events
    this.tcpServer.on("connection", this._onSocketConnect.bind(this));

    // Install handlers
    this.handlers.add(new HandshakeMessageHandler(this, 0, 0));
    this.handlers.add(new StatusRequestMessageHandler(this, 1, 0));
    this.handlers.add(new StatusPingMessageHandler(this, 1, 1));
  }

  public start(): void {
    // TODO: config in constructor
    this.tcpServer.listen(25565, "0.0.0.0");
    console.log(`[server] server listening`);
  }

  protected _onSocketConnect(socket: net.Socket): void {
    const connection = new Connection(socket);
    console.log(`[server] connection from ${connection.remote}`);
    this.connections.add(connection);

    // Bind connection events -- TODO: move this to Player class
    connection.on("disconnect", () => {
      console.log(`[server] ${connection.remote} disconnected`);
      this.connections.delete(connection);
    });

    connection.on("message", msg => {
      console.log(`[server] message 0x${msg.packetID.toString(16)} (len = ${msg.payload.remaining}) recv from ${connection.remote}`);
      for (const handler of this.handlers) {
        if (handler.state != connection.state) continue;
        if (handler.id != msg.packetID) continue;
        handler.handle(msg.payload, connection); // TODO player
        return;
      }
      // TODO handle
      console.error(`[server] invalid message recv (state = ${connection.state}, id = ${msg.packetID})`);
    });
  }
}
