// Player.ts - Base class for player, with networking, world events, etc.
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

/* eslint-disable @typescript-eslint/no-non-null-assertion */

import Connection from "./Connection";
import Server from "./Server";
import { InventoryHotbarSlot } from "../utils/Enums";
import { PlayClientboundHeldItemChangeMessage } from "../net/protocol/messages/play/clientbound/PlayClientboundHeldItemChangeMessage";
import { Chat } from "../utils/Chat";
import { IClientboundMessage } from "../net/protocol/Message";
import { Vec3, Vec5 } from "../utils/Geometry";
import { Entity } from "./Entity";
import { ConnectionState } from "./Connection";
import { PlayClientboundKeepAliveMessage } from "../net/protocol/messages/play/clientbound/PlayClientboundKeepAlive";

export interface PlayerInitializeOptions {
  username: string;
}

export class Player extends Entity {
  public connection: Connection;
  public server: Server;

  #initialized = false;
  #username: string | null = null;

  public position = Vec5.ZERO;
  public onGround = false;
  public lastPositionOnGround: Vec3 | null = null;
  public lastTickOnGround: number | null = null;

  public lastKeepAliveTick: number | null = null;

  #checkInitialized(access?: string): true {
    if (!this.#initialized) {
      if (access) {
        throw new Error(`${access} called before Player initialization`);
      }
      throw new Error("Player not initialized");
    }
    return true;
  }

  private _initialize(options: PlayerInitializeOptions): void {
    if (this.#initialized) {
      throw new Error("Player already initialized");
    }
    this.#username = options.username;

    // TODO: Set initial position

    this.#initialized = true;
  }

  public get username(): string {
    return this.#checkInitialized("Player.username") && this.#username!;
  }

  public constructor(server: Server, connection: Connection) {
    super(server);
    this.connection = connection;
    this.server = server;
  }

  public disconnect(reason: Chat = "Disconnected"): void {
    this.connection.disconnect(reason);
  }

  public sendPacket(message: IClientboundMessage): void {
    this.connection.writeMessage(message);
  }

  public setHotbarSlot(slot: InventoryHotbarSlot): void {
    this.connection.writeMessage(
      new PlayClientboundHeldItemChangeMessage({
        slot,
      }),
    );
  }

  public setState(state: ConnectionState): void {
    if (state < this.connection.state) {
      throw new Error("Cannot go back in state");
    }
    this.connection.state = state;
    if (state === ConnectionState.PLAY) {
      this.server.emit("playerJoin", this);
    }
  }

  protected _tick(tick: number): void {
    if (this.connection.state === ConnectionState.PLAY) {
      if (this.lastKeepAliveTick === null) {
        this.lastKeepAliveTick = tick;
      } else if (tick - this.lastKeepAliveTick > 20 * 30) {
        this.disconnect("KeepAlive timeout");
      } else if (tick - this.lastKeepAliveTick > 20 * Math.floor(Math.random() * 20)) {
        this.server.logger.debug(`Sending keepalive to ${this.username}`);
        this.sendPacket(new PlayClientboundKeepAliveMessage({ keepAliveId: BigInt(tick) }));
        this.lastKeepAliveTick = tick;
      }
    }
  }
}
