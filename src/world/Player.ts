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

import util from "util";
import { Dimension } from "./Dimension";
import { Entity } from "./Entity";
import { Vec3, Vec5 } from "../../native";
import codecDef from "../assets/codec";
import { int, float, double } from "../data/NBT";
import { PlayClientboundChatMessage } from "../net/protocol/messages/play/clientbound/PlayClientboundChatMessage";
import { PlayClientboundEntityStatusMessage } from "../net/protocol/messages/play/clientbound/PlayClientboundEntityStatusMessage";
import { PlayClientboundHeldItemChangeMessage } from "../net/protocol/messages/play/clientbound/PlayClientboundHeldItemChangeMessage";
import { PlayClientboundJoinGameMessage } from "../net/protocol/messages/play/clientbound/PlayClientboundJoinGameMessage";
import { PlayClientboundKeepAliveMessage } from "../net/protocol/messages/play/clientbound/PlayClientboundKeepAlive";
import { PlayClientboundPluginMessage } from "../net/protocol/messages/play/clientbound/PlayClientboundPluginMessage";
import { PlayClientboundPositionAndLookMessage } from "../net/protocol/messages/play/clientbound/PlayClientboundPositionAndLookMessage";
import { PlayClientboundServerDifficultyMessage } from "../net/protocol/messages/play/clientbound/PlayClientboundServerDifficultyMessage";
import Connection, { ConnectionState } from "../server/Connection";
import { Chat } from "../utils/Chat";
import { AllEntityStatus, Difficulty, GameMode, InventoryHotbarSlot, PluginChannel, ClientChatPosition } from "../utils/Enums";

export interface PlayerOptions {
  username: string;
}

export class Player extends Entity {
  public readonly connection: Connection;

  public constructor(dimension: Dimension, entityId: number, connection: Connection, options?: PlayerOptions) {
    super(dimension, entityId);
    this.connection = connection;

    if (options) {
      this.username = options.username;
    }
  }

  private _username: string | null = null;

  public get username(): string {
    // if (this._username === null) throw new Error("Player.username is not set");
    return this._username ?? "unknown";
  }

  public set username(usernameInput: string) {
    if (!/^[a-zA-Z0-9_]{2,16}$/.test(usernameInput)) throw new Error(`Invalid username ${usernameInput}`);
    this._username = usernameInput;
  }

  private _hotbarSlot: InventoryHotbarSlot = InventoryHotbarSlot.SLOT_1;

  public get hotbarSlot(): InventoryHotbarSlot {
    return this._hotbarSlot;
  }

  public set hotbarSlot(slot: InventoryHotbarSlot) {
    void this.setHotbarSlotAsync(slot);
  }

  public load() {
    // Bind connection events
    this.connection.on("disconnect", () => {
      this.server.logger.debug(`${this.connection.remote}: disconnected`);
      this.dimension.players.delete(this);
      void this.end();
    });

    this.connection.on("message", msg => {
      const handler = this.server.handlerFactory.getHandler(msg.packetID, this.connection.state);

      if (handler) {
        try {
          handler.handle(msg.payload, this);
        } catch (err) {
          this.server.logger.error(util.inspect(err));
          void this.connection.disconnect({ text: String(err), color: "red" });
        }
      } else {
        // TODO handle
        this.server.logger.error(
          `${this.connection.remote}: invalid message (state = ${ConnectionState[this.connection.state]} [${this.connection.state}]), id = ${
            msg.packetID
          } / 0x${msg.packetID.toString(16).padStart(2, "0")})`,
        );
      }
    });
  }

  public async setHotbarSlotAsync(slot: InventoryHotbarSlot): Promise<void> {
    if (this.connection.state !== ConnectionState.PLAY) {
      this.server.logger.warn(`Player.setHotbarSlotAsync can only be called in PLAY state, but is called in ${ConnectionState[this.connection.state]}`);
      return;
    }
    await this.connection.writeMessage(
      new PlayClientboundHeldItemChangeMessage({
        slot,
      }),
    );
    this._hotbarSlot = slot;
  }

  private _position: Vec5 = Vec5.zero();

  public get position(): Vec5 {
    return this._position;
  }

  public set position(position: Vec5) {
    this._position = position;
  }

  private _lastPositionOnGround: Vec3 | null = null;
  private _isOnGround = false;
  private _lastTickOnGround = -1;
  private _lastKeepAliveTick = -1;

  public get maxDistancePerTick(): number {
    return 1.4 / 20;
  }

  // TODO: implement this method
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  public sendChunks(_chunkX: number, _chunkZ: number) {}

  public async setPositionChecked(position: Vec5, onGround: boolean): Promise<void> {
    // const distance = this._position.distance(position);
    // if (distance > this.maxDistancePerTick)
    //   throw new Error(`Player.setPositionChecked can only be called with a distance of ${this.maxDistancePerTick}, but is called with ${distance}`);
    await this.setPositionUnchecked(position, onGround);
  }

  public async setPositionUnchecked(position: Vec5, onGround: boolean): Promise<void> {
    if (this.connection.state !== ConnectionState.PLAY)
      throw new Error(`Player.setPositionUnchecked can only be called in PLAY state, but is called in ${ConnectionState[this.connection.state]}`);
    if (this._position.toVec3().x !== position.toVec3().x || this._position.toVec3().z !== position.toVec3().z) {
      await this.dimension.updatePlayerPosition(this, position);
    }

    this._position = position;
    this._isOnGround = onGround;
    this._lastPositionOnGround = onGround ? position : null;
    // TODO: writeMessage
    await Promise.resolve();
  }

  public async disconnect(reason: Chat = "Disconnected"): Promise<void> {
    await this.connection.disconnect(reason);
  }

  public override async init(): Promise<void> {
    // This is called when the player is created, after the constructor
    // TODO
  }

  public override async tick(tick: number): Promise<void> {
    if (this._lastKeepAliveTick === -1) {
      this._lastKeepAliveTick = tick;
    } else if (tick - this._lastKeepAliveTick > 20 * 30) {
      await this.disconnect("KeepAlive timeout");
    } else if (tick - this._lastKeepAliveTick > 20 * Math.floor(Math.random() * 20)) {
      await this.connection.writeMessage(new PlayClientboundKeepAliveMessage({ keepAliveId: BigInt(tick) }));
      this._lastKeepAliveTick = tick;
    }
    if (this.connection.state === ConnectionState.PLAY) {
      if (this._lastTickOnGround === -1) {
        this._lastTickOnGround = tick;
      }
      if (this._isOnGround) {
        this._lastTickOnGround = tick;
        this._lastPositionOnGround = this._position.toVec3();
      }
    }
  }

  public override async end(): Promise<void> {
    this.connection.destroy();
    if (this.connection.state === ConnectionState.PLAY) {
      await this.server.broadcastChat(
        {
          color: "yellow",
          text: `${this.username} left the game`,
        },
        ClientChatPosition.SYSTEM_MESSAGE,
      );
    }
  }

  public getHotbarSlot(): InventoryHotbarSlot {
    return this.hotbarSlot;
  }

  public async sendChat(chat: Chat, position: ClientChatPosition = ClientChatPosition.CHAT_BOX, sender: string | null = null): Promise<void> {
    if (this.connection.state !== ConnectionState.PLAY)
      throw new Error(`Player.sendChat can only be called in PLAY state, but is called in ${ConnectionState[this.connection.state]}`);
    await this.connection.writeMessage(
      new PlayClientboundChatMessage({
        chat,
        position,
        sender,
      }),
    );
  }

  public async sendDifficulty(difficulty: Difficulty, difficultyLocked = false) {
    await this.connection.writeMessage(
      new PlayClientboundServerDifficultyMessage({
        difficulty,
        difficultyLocked,
      }),
    );
  }

  public async setState(state: ConnectionState): Promise<void> {
    if (state < this.connection.state) throw new Error("Cannot go back in state");
    this.connection.state = state;
    switch (state) {
      case ConnectionState.LOGIN: {
        break;
      }
      case ConnectionState.PLAY: {
        this.server.emit("playerJoin", this);
        await this.server.nextTick();
        const joinGameResponse = new PlayClientboundJoinGameMessage({
          entityId: this.entityId,
          isHardcore: this.world.isHardcore,
          gamemode: GameMode.CREATIVE, // TODO
          previousGameMode: GameMode.NONE,
          worlds: ["minecraft:overworld"],
          dimensionCodec: codecDef,
          dimension: {
            infiniburn: "#minecraft:infiniburn_overworld",
            effects: "minecraft:overworld",
            ultrawarm: false,
            logical_height: int(384),
            height: int(384),
            natural: true,
            min_y: int(-64),
            bed_works: true,
            coordinate_scale: double(1),
            piglin_safe: false,
            has_skylight: true,
            has_ceiling: false,
            ambient_light: float(0),
            has_raids: true,
            respawn_anchor_works: false,
          },
          worldName: "minecraft:overworld",
          hashedSeed: 1n,
          maxPlayers: 20, // TODO
          viewDistance: 32,
          simulationDistance: 32,
          reducedDebugInfo: false,
          enableRespawnScreen: false,
          isDebug: false,
          isFlat: false,
        });
        await this.connection.writeMessage(joinGameResponse);
        await this.connection.writeMessage(
          new PlayClientboundPluginMessage({
            channel: PluginChannel.MINECRAFT_BRAND,
            // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
            data: b => {
              b.writeString(this.dimension.world.server.brand);
            },
          }),
        );
        await this.sendDifficulty(this.world.difficulty);
        await this.connection.writeMessage(
          new PlayClientboundEntityStatusMessage({
            entityId: this.entityId,
            status: AllEntityStatus.PLAYER__SET_OP_PERMISSION_1, // TODO: read from config, validate, etc.
          }),
        );
        // TODO: refactor to set position()
        await this.connection.writeMessage(
          new PlayClientboundPositionAndLookMessage({
            position: new Vec5(0, 270, 0, 0, 0),
            flags: {
              x: false,
              y: false,
              z: false,
              y_rot: false,
              x_rot: false,
            },
            teleportId: 1,
            dismountVehicle: true,
          }),
        );

        await this.server.broadcastChat(
          {
            color: "yellow",
            text: `${this.username} joined the game`,
          },
          ClientChatPosition.SYSTEM_MESSAGE,
        );

        await this.dimension.updatePlayerPosition(this, new Vec5(0, 270, 0, 0, 0));

        break;
      }
      case ConnectionState.HANDSHAKE: {
        break;
      }
      case ConnectionState.STATUS: {
        break;
      }
    }
  }
}
