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
import ConnectionHandler from "../net/ConnectionHandler";
import MineBuffer from "../utils/MineBuffer";

export default class Server extends EventEmitter {
  public tcpServer: net.Server = new net.Server();
  public connections: Set<ConnectionHandler> = new Set();

  public constructor() {
    super();

    // Bind events
    this.tcpServer.on("connection", this._onSocketConnect.bind(this));
  }

  public start(): void {
    // TODO: config in constructor
    this.tcpServer.listen(25565, "0.0.0.0");
    console.log(`[server] server listening`);
  }

  protected _onSocketConnect(socket: net.Socket): void {
    const remote = `${socket.remoteAddress}:${socket.remotePort}`;
    console.log(`[server] connection from ${remote}`);
    const connection = new ConnectionHandler(socket);
    this.connections.add(connection);
    // Bind connection events -- TODO: move this to Player class
    connection.on("disconnect", () => {
      console.log(`[server] ${remote} disconnected`);
      this.connections.delete(connection);
    });
    connection.on("message", msg => {
      console.log(`[server] message 0x${msg.packetID.toString(16)} (len = ${msg.payload.remaining}) recv from ${remote}`);

      // FOR TESTING
      const data = new MineBuffer();
      const json = JSON.stringify({
        version: {
          name: "1.8.7",
          protocol: 47,
        },
        players: {
          max: 100,
          online: 0,
          sample: [],
        },
        description: {
          text: "Hello, World!",
        },
      });
      data.writeString(json);
      connection.write(0, data);
    });
  }
}
