// Server.ts - Main server interfaces and classes
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

import { EventEmitter } from "eventemitter3";
import net from "net";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import util from "util";

import Connection, { ConnectionState } from "./Connection";
import MessageHandlerFactory from "../net/protocol/messages/MessageHandlerFactory";
import { getRootDirectory } from "../utils/DeployUtils";
import { Logger, LogLevel } from "../utils/Logger";
import { StdoutConsumer, FileConsumer } from "../utils/Logger";
import { GAME_VERSION, MINENODE_VERSION, PROTOCOL_VERSION } from "../utils/Constants";

export interface ServerOptions {
  compressionThreshold: number;
  motd: string;
  maxPlayers: number;
  favicon?: string;
}

export default class Server extends EventEmitter<{
  tick: [number];
}> {
  public tcpServer: net.Server = new net.Server();
  public connections: Set<Connection> = new Set();
  public handlerFactory: MessageHandlerFactory;

  public encodedFavicon?: string;
  public keypair!: crypto.KeyPairKeyObjectResult;

  public tickCount = 0;
  public ticker: NodeJS.Timer | null = null;
  private running = false;

  public readonly logger = new Logger("Server")
    .withConsumer(new StdoutConsumer({ minLevel: process.env.MINENODE_DEBUG ? LogLevel.DEBUG : LogLevel.INFO }))
    .withConsumer(new FileConsumer({ minLevel: process.env.MINENODE_DEBUG ? LogLevel.DEBUG : LogLevel.INFO }));

  public constructor(public readonly options: Readonly<ServerOptions>) {
    super();

    // Bind events
    this.tcpServer.on("connection", this._onSocketConnect.bind(this));

    this.handlerFactory = new MessageHandlerFactory(this);

    // Display license message
    this.logger.info(`MineNode ${MINENODE_VERSION} - implementing MC ${GAME_VERSION} (${PROTOCOL_VERSION})`);
    this.logger.info(`Copyright (C) ${new Date().getFullYear()} MineNode. All rights reserved.`);
    this.logger.info("AGPLv3 Licence - https://www.gnu.org/licenses/agpl-3.0.html");
  }

  protected generateKeyPair(): void {
    this.keypair = crypto.generateKeyPairSync("rsa", {
      modulusLength: 1024,
    });
    this.logger.info("generated RSA keypair, 1024-bit modulus");
  }

  protected loadServerIcon(): void {
    if (!this.options.favicon) {
      this.logger.info("no server icon was set");
      return;
    }
    const serverIconPath = path.resolve(getRootDirectory(), this.options.favicon);
    if (fs.existsSync(serverIconPath) && fs.statSync(serverIconPath).isFile()) {
      if (fs.statSync(serverIconPath).size > (65535 * 3) / 4) {
        this.logger.error(`${serverIconPath} is too large. Cannot exceed ${(65535 * 3) / 4} bytes.`);
        return;
      } else {
        const raw = fs.readFileSync(serverIconPath);
        this.encodedFavicon = "data:image/png;base64," + raw.toString("base64");
        this.logger.info(`loaded favicon from ${serverIconPath} (${raw.length} bytes -> ${this.encodedFavicon.length} encoded)`);
      }
    } else {
      this.logger.info(`${serverIconPath} does not exist`);
    }
  }

  public start(): void {
    this.loadServerIcon();
    this.generateKeyPair();
    // TODO: config in constructor
    this.tcpServer.listen(25565, "0.0.0.0");
    // Start tick
    this.running = true;
    this.ticker = setInterval(this._tick.bind(this), 1000 / 20);
    this.logger.info(`server listening`);
  }

  protected _tick(): void {
    this.tickCount++;
    this.emit("tick", this.tickCount);
  }

  public nextTick(): Promise<number> {
    if (!this.running) {
      return Promise.reject(new Error("Server is not running"));
    }
    return new Promise(resolve => {
      this.once("tick", tick => {
        resolve(tick);
      });
    });
  }

  protected _onSocketConnect(socket: net.Socket): void {
    const connection = new Connection(this, socket);
    connection.encryption.setKeypair(this.keypair);
    connection.compression.setThreshold(this.options.compressionThreshold);

    this.logger.info(`${connection.remote}: connected`);
    this.connections.add(connection);

    // Bind connection events
    // TODO: move this to Player class
    connection.on("disconnect", () => {
      this.logger.info(`${connection.remote}: disconnected`);
      this.connections.delete(connection);
    });

    connection.on("message", msg => {
      this.logger.debug(`${connection.remote}: message 0x${msg.packetID.toString(16)} (len = ${msg.payload.remaining}) recv`);

      const handler = this.handlerFactory.getHandler(msg.packetID, connection.state);

      if (handler) {
        try {
          handler.handle(msg.payload, connection);
        } catch (err) {
          this.logger.error(util.inspect(err));
          connection.disconnect({ text: String(err), color: "red" });
        }
        this.logger.debug(`${connection.remote}: message '${handler.label}' handled`);
      } else {
        // TODO handle
        this.logger.error(
          `${connection.remote}: invalid message (state = ${ConnectionState[connection.state]} [${connection.state}]), id = ${msg.packetID} / 0x${msg.packetID
            .toString(16)
            .padStart(2, "0")})`,
        );
      }
    });
  }
}
