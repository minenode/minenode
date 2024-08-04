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

import crypto from "crypto";
import fs from "fs";
import net from "net";
import path from "path";
import { EventEmitter } from "eventemitter3";
import Connection, { ConnectionState } from "./Connection";
import MessageHandlerFactory from "../net/protocol/messages/MessageHandlerFactory";
import { Chat, consoleFormatChat } from "../utils/Chat";
import { GAME_VERSION, MINENODE_VERSION, PROTOCOL_VERSION } from "../utils/Constants";
import { getRootDirectory } from "../utils/DeployUtils";
import { ClientChatPosition } from "../utils/Enums";
import { Logger, LogLevel, StdoutConsumer, FileConsumer } from "../utils/Logger";
import { Performance } from "../utils/Performance";
import { first, parallel, find } from "../utils/SetUtils";
import { Dimension } from "../world/Dimension";
import { Entity } from "../world/Entity";
import { Player } from "../world/Player";
import { World } from "../world/World";

export interface ServerOptions {
  compressionThreshold: number;
  motd: string;
  maxPlayers: number;
  favicon: string;
}

export default class Server extends EventEmitter<{
  tick: [number];
  playerJoin: [Player];
}> {
  public tcpServer: net.Server = new net.Server();
  public handlerFactory: MessageHandlerFactory;

  public worlds: Set<World> = new Set();

  public *dimensions(): IterableIterator<Dimension> {
    for (const world of this.worlds) {
      for (const dimension of world.dimensions) {
        yield dimension;
      }
    }
  }

  public *players(): IterableIterator<Player> {
    for (const world of this.worlds) {
      for (const player of world.players()) {
        yield player;
      }
    }
  }

  public getPlayer(username: string): Player | null {
    return find(this.players(), player => player.username === username) ?? null;
  }

  public encodedFavicon?: string;
  public keypair!: crypto.KeyPairKeyObjectResult;

  public tickCount = 0;
  public ticker: NodeJS.Timer | null = null;
  private running = false;

  public readonly performance = new Performance(20 * 60 * 5);

  public readonly brand = "MineNode";

  public readonly logger = new Logger("Server")
    .withConsumer(new StdoutConsumer({ minLevel: process.env.MINENODE_DEBUG ? LogLevel.DEBUG : LogLevel.INFO }))
    .withConsumer(new FileConsumer({ minLevel: process.env.MINENODE_DEBUG ? LogLevel.DEBUG : LogLevel.INFO }));

  public constructor(public readonly options: Readonly<ServerOptions>) {
    super();

    // TODO: this is temporary
    const mainWorld = new World(this);
    this.worlds.add(mainWorld);

    // Bind events
    this.tcpServer.on("connection", this._onSocketConnect.bind(this));

    this.handlerFactory = new MessageHandlerFactory(this);
  }

  public async broadcastChat(chat: Chat, position: ClientChatPosition = ClientChatPosition.CHAT_BOX, sender: string | null = null, log = true): Promise<void> {
    for (const player of this.players()) {
      if (player.connection.state === ConnectionState.PLAY) {
        await player.sendChat(chat, position, sender);
      }
    }
    if (log) {
      this.logger.info(`[Broadcast:${ClientChatPosition[position]}] ${consoleFormatChat(chat)}`);
    }
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
      } else {
        const raw = fs.readFileSync(serverIconPath);
        this.encodedFavicon = `data:image/png;base64,${raw.toString("base64")}`;
        this.logger.info(`loaded favicon from ${serverIconPath} (${raw.length} bytes -> ${this.encodedFavicon.length} encoded)`);
      }
    } else {
      this.logger.info(`${serverIconPath} does not exist`);
    }
  }

  public async start(): Promise<void> {
    // Display license message
    this.logger.info(`MineNode ${MINENODE_VERSION} - implementing MC ${GAME_VERSION} (${PROTOCOL_VERSION})`);
    this.logger.info(`Copyright (C) ${new Date().getFullYear()} MineNode. All rights reserved.`);
    this.logger.info("AGPLv3 Licence - https://www.gnu.org/licenses/agpl-3.0.html");

    this.loadServerIcon();
    this.generateKeyPair();

    // TODO: init worlds - I don't know if you need to stay here
    await parallel(this.worlds.values(), e => e.init());

    // TODO: load from config
    this.tcpServer.listen(25565, "0.0.0.0");

    // Start tick
    this.running = true;
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    this.ticker = setInterval(this.tick.bind(this), 1000 / 20);
    this.logger.info("server listening");
  }

  public async stop(): Promise<void> {
    this.running = false;
    if (this.ticker) {
      clearInterval(this.ticker);
    }

    await parallel(this.players(), player => player.disconnect("Server is shutting down"));
    await parallel(this.worlds, world => world.end());

    this.tcpServer.close();
    this.logger.info("server stopped");
    this.tcpServer.removeAllListeners();
    this.removeAllListeners();
  }

  protected async tick(): Promise<void> {
    this.performance.tick();
    this.tickCount++;
    this.emit("tick", this.tickCount);

    await parallel(this.players(), player => player.tick(this.tickCount));
    await parallel(this.worlds, world => world.tick(this.tickCount));

    if (this.tickCount % (20 * 50) === 0) {
      this.logger.debug(`tick ${this.tickCount}, TPS = ${((this.performance.average / 1_000_000) * (20 / 50)).toFixed(1)}`);

      const memoryUsage = process.memoryUsage();
      this.logger.debug(`RSS: ${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`);
      this.logger.debug(`Heap Total: ${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`);
      this.logger.debug(`Heap Used: ${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`);
      this.logger.debug(`External: ${(memoryUsage.external / 1024 / 1024).toFixed(2)} MB`);
      this.logger.debug(`Array Buffers: ${(memoryUsage.arrayBuffers / 1024 / 1024).toFixed(2)} MB`);
      this.logger.debug("-----------------------------------");
    }
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

    this.logger.debug(`${connection.remote}: connected`);

    // TODO: this is temporary - must get the world configured xml
    const dimension = first(this.dimensions())!;

    const player = new Player(dimension, ++Entity.RUNTIME_ID, connection);
    dimension.players.add(player);

    player.load();
  }
}
