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

import { Dimension } from "./Dimension";
import { Entity } from "./Entity";
import { Vec3, Vec5 } from "../../native";
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
    if (this._username === null) throw new Error("Player.username is not set");
    return this._username;
  }

  public set username(username: string) {
    if (!/^[a-zA-Z0-9_]{2,16}$/.test(username)) throw new Error(`Invalid username ${username}`);
    this._username = username;
  }

  private _hotbarSlot: InventoryHotbarSlot = InventoryHotbarSlot.SLOT_1;

  public get hotbarSlot(): InventoryHotbarSlot {
    return this._hotbarSlot;
  }

  public set hotbarSlot(slot: InventoryHotbarSlot) {
    void this.setHotbarSlotAsync(slot);
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

  public async setPositionChecked(position: Vec5, onGround: boolean): Promise<void> {
    // const distance = this._position.distance(position);
    // if (distance > this.maxDistancePerTick)
    //   throw new Error(`Player.setPositionChecked can only be called with a distance of ${this.maxDistancePerTick}, but is called with ${distance}`);
    await this.setPositionUnchecked(position, onGround);
  }

  public async setPositionUnchecked(position: Vec5, onGround: boolean): Promise<void> {
    if (this.connection.state !== ConnectionState.PLAY)
      throw new Error(`Player.setPositionUnchecked can only be called in PLAY state, but is called in ${ConnectionState[this.connection.state]}`);
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
      if (tick - this._lastTickOnGround > 20 * 10) {
        // await this.disconnect("Player is not on ground");
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
          dimensionCodec: {
            "minecraft:dimension_type": {
              type: "minecraft:dimension_type",
              value: [
                {
                  element: {
                    ambient_light: float(0.0),
                    bed_works: true,
                    coordinate_scale: double(1.0),
                    effects: "minecraft:overworld",
                    has_ceiling: false,
                    has_raids: true,
                    has_skylight: true,
                    height: int(384),
                    infiniburn: "#minecraft:infiniburn_overworld",
                    logical_height: int(384),
                    min_y: int(-64),
                    natural: true,
                    piglin_safe: false,
                    respawn_anchor_works: false,
                    ultrawarm: false,
                  },
                  id: int(0),
                  name: "minecraft:overworld",
                },
              ],
            },
            "minecraft:worldgen/biome": {
              type: "minecraft:worldgen/biome",
              value: [
                {
                  element: {
                    category: "plains",
                    downfall: float(0.4),
                    effects: {
                      sky_color: int(7907327),
                      water_fog_color: int(329011),
                      fog_color: int(12638463),
                      water_color: int(4159204),
                      mood_sound: {
                        tick_delay: int(6000),
                        offset: double(2.0),
                        sound: "minecraft:ambient.cave",
                        block_search_extent: int(8),
                      },
                    },
                    depth: float(0.125),
                    precipitation: "rain",
                    temperature: float(0.8),
                    scale: float(0.05),
                  },
                  id: int(1),
                  name: "minecraft:plains",
                },
              ],
            },
          },
          dimension: {
            piglin_safe: false, // TODO: implicitly convert boolean to byte
            natural: true,
            ambient_light: float(0.0),
            infiniburn: "#minecraft:infiniburn_overworld",
            respawn_anchor_works: false,
            has_skylight: true,
            bed_works: true,
            effects: "minecraft:overworld",
            has_raids: true,
            min_y: int(0),
            height: int(256),
            logical_height: int(256),
            coordinate_scale: double(1.0),
            ultrawarm: false,
            has_ceiling: false,
          },
          worldName: "minecraft:overworld",
          hashedSeed: 1n,
          maxPlayers: 20, // TODO
          viewDistance: 10,
          simulationDistance: 10,
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
            status: AllEntityStatus.PLAYER__SET_OP_PERMISSION_4, // TODO: read from config, validate, etc.
          }),
        );
        // TODO: refactor to set position()
        await this.connection.writeMessage(
          new PlayClientboundPositionAndLookMessage({
            position: new Vec5(0, 1, 0, 0, 0),
            flags: {
              x: false,
              y: false,
              z: false,
              y_rot: false,
              x_rot: false,
            },
            teleportId: 69,
            dismountVehicle: false,
          }),
        );

        await this.server.broadcastChat(
          {
            color: "yellow",
            text: `${this.username} joined the game`,
          },
          ClientChatPosition.SYSTEM_MESSAGE,
        );

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
