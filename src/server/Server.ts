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
import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import * as appRootPath from "app-root-path";

import Connection, { getConnectionState } from "./Connection";
import MessageHandlerFactory from "../net/protocol/messages/MessageHandlerFactory";

export interface ServerOptions {
  compressionThreshold: number;
}

export default class Server extends EventEmitter {
  public tcpServer: net.Server = new net.Server();
  public connections: Set<Connection> = new Set();
  public handlerFactory: MessageHandlerFactory;

  public encodedFavicon?: string;
  public keypair!: crypto.KeyPairKeyObjectResult;

  public constructor(public readonly options: Readonly<ServerOptions>) {
    super();

    // Bind events
    this.tcpServer.on("connection", this._onSocketConnect.bind(this));

    this.handlerFactory = new MessageHandlerFactory(this);
  }

  protected generateKeyPair(): void {
    this.keypair = crypto.generateKeyPairSync("rsa", {
      modulusLength: 1024,
    });
    console.log("[server/INFO] generated RSA keypair, 1024-bit modulus");
  }

  protected loadServerIcon(): void {
    // TODO: this path should be passed as part of config
    const serverIconPath = path.resolve(appRootPath.path, "server-icon.png");
    if (fs.existsSync(serverIconPath) && fs.statSync(serverIconPath).isFile()) {
      if (fs.statSync(serverIconPath).size > 1024 * 1024) {
        console.error("[server/ERROR] server-icon.png is too large. Cannot exceed 1 MB.");
        return;
      } else {
        const raw = fs.readFileSync(serverIconPath);
        this.encodedFavicon = "data:image/png;base64," + raw.toString("base64");
        console.log(`[server/INFO] loaded favicon from server-icon.png (${raw.length} bytes -> ${this.encodedFavicon.length} encoded)`);
      }
    } else {
      console.log("[server/INFO] server-icon.png does not exist");
    }
  }

  public start(): void {
    this.loadServerIcon();
    this.generateKeyPair();
    // TODO: config in constructor
    this.tcpServer.listen(25565, "0.0.0.0");
    console.log(`[server/INFO] server listening`);
  }

  protected _onSocketConnect(socket: net.Socket): void {
    const connection = new Connection(this, socket);
    console.log(`[server/INFO] ${connection.remote}: connected`);
    this.connections.add(connection);

    // Bind connection events -- TODO: move this to Player class
    connection.on("disconnect", () => {
      console.log(`[server/INFO] ${connection.remote}: disconnected`);
      this.connections.delete(connection);
    });

    connection.on("message", msg => {
      console.log(`[server/DEBUG] ${connection.remote}: message 0x${msg.packetID.toString(16)} (len = ${msg.payload.remaining}) recv`);

      const handler = this.handlerFactory.getHandler(msg.packetID, connection.state);

      if (handler) {
        try {
          handler.handle(msg.payload, connection);
        } catch (err) {
          console.error(err);
          connection.disconnect({ text: String(err), color: "red" });
        }
        console.log(`[server/DEBUG] ${connection.remote}: message '${handler.label}' handled`);
      } else {
        // TODO handle
        console.error(
          `[server/ERROR] ${connection.remote}: invalid message (state = ${getConnectionState(connection.state)} [${connection.state}]), id = ${msg.packetID})`,
        );
      }
    });
  }
}
