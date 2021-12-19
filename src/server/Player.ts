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
import { AllEntityStatus, Difficulty, GameMode, InventoryHotbarSlot, PluginChannel } from "../utils/Enums";
import { PlayClientboundHeldItemChangeMessage } from "../net/protocol/messages/play/clientbound/PlayClientboundHeldItemChangeMessage";
import { Chat } from "../utils/Chat";
import { IClientboundMessage } from "../net/protocol/Message";
import { Vec3, Vec5 } from "../utils/Geometry";
import { Entity } from "./Entity";
import { ConnectionState } from "./Connection";
import { PlayClientboundKeepAliveMessage } from "../net/protocol/messages/play/clientbound/PlayClientboundKeepAlive";
import { PlayClientboundPluginMessage } from "../net/protocol/messages/play/clientbound/PlayClientboundPluginMessage";
import { MineBuffer } from "../../native";
import { PlayClientboundServerDifficultyMessage } from "../net/protocol/messages/play/clientbound/PlayClientboundServerDifficultyMessage";
import { PlayClientboundEntityStatusMessage } from "../net/protocol/messages/play/clientbound/PlayClientboundEntityStatusMessage";
import { PlayClientboundPositionAndLookMessage } from "../net/protocol/messages/play/clientbound/PlayClientboundPositionAndLookMessage";
import { int, float, double } from "../data/NBT";
import { PlayClientboundJoinGameMessage } from "../net/protocol/messages/play/clientbound/PlayClientboundJoinGameMessage";
import { destroy } from "../core/Base";

export interface PlayerInitializeOptions {
  username: string;
  hotbarSlot: InventoryHotbarSlot;
}

export class Player extends Entity<PlayerInitializeOptions> {
  public connection: Connection;
  public server: Server;

  #initialized = false;
  #username: string | null = null;

  public position = Vec5.zero();
  public onGround = false;
  public lastPositionOnGround: Vec3 | null = null;
  public lastTickOnGround: number | null = null;

  public lastKeepAliveTick: number | null = null;

  #hotbarSlot: InventoryHotbarSlot | null = null;

  protected override _initialize(options: PlayerInitializeOptions): void {
    if (this.#initialized) {
      throw new Error("Player already initialized");
    }
    this.#username = options.username;
    this.hotbarSlot = options.hotbarSlot;
  }

  public get username(): string {
    return this._assertInitialized("username") && this.#username!;
  }

  public constructor(server: Server, connection: Connection) {
    super(server);
    this.connection = connection;
    this.server = server;
  }

  protected override _destroy(): void {
    destroy(this.connection);
  }

  public disconnect(reason: Chat = "Disconnected"): void {
    this.connection.disconnect(reason);
  }

  public sendPacket(message: IClientboundMessage): void {
    this.connection.writeMessage(message);
  }

  public set hotbarSlot(slot: InventoryHotbarSlot) {
    // this._assert(this.connection.state === ConnectionState.PLAY, "Player.hotbarSlot can only be set in PLAY state");
    if (this.connection.state !== ConnectionState.PLAY) {
      this.server.logger.warn(`Player.hotbarSlot can only be set in PLAY state, but is set to ${slot}`);
      this.connection.once("stateChange", () => {
        if (this.connection.state === ConnectionState.PLAY) {
          this.hotbarSlot = slot;
        }
      });
      return;
    }
    this.connection.writeMessage(
      new PlayClientboundHeldItemChangeMessage({
        slot,
      }),
    );
    this.#hotbarSlot = slot;
  }

  public get hotbarSlot(): InventoryHotbarSlot {
    return this._assertInitialized("hotbarSlot") && this.#hotbarSlot!;
  }

  public async setState(state: ConnectionState): Promise<void> {
    if (state < this.connection.state) {
      throw new Error("Cannot go back in state");
    }
    this.connection["state"] = state;
    switch (state) {
      case ConnectionState.LOGIN: {
        break;
      }
      case ConnectionState.PLAY: {
        this.server.emit("playerJoin", this);
        await this.nextTick();
        const joinGameResponse = new PlayClientboundJoinGameMessage({
          entityId: 1,
          isHardcore: false,
          gamemode: GameMode.SURVIVAL,
          previousGameMode: GameMode.NONE,
          worlds: ["minecraft:overworld"],
          dimensionCodec: {
            "minecraft:dimension_type": {
              type: "minecraft:dimension_type",
              value: [
                {
                  name: "minecraft:overworld",
                  id: int(0),
                  element: {
                    piglin_safe: false,
                    natural: true,
                    ambient_light: float(0.0),
                    infiniburn: "minecraft:infiniburn_overworld",
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
                },
              ],
            },
            "minecraft:worldgen/biome": {
              type: "minecraft:worldgen/biome",
              value: [
                {
                  name: "minecraft:plains",
                  id: int(1),
                  element: {
                    precipitation: "rain",
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
                    temperature: float(0.8),
                    scale: float(0.05),
                    downfall: float(0.4),
                    category: "plains",
                  },
                },
              ],
            },
          },
          dimension: {
            piglin_safe: false, // TODO: implicitly convert boolean to byte
            natural: true,
            ambient_light: float(0.0),
            infiniburn: "minecraft:infiniburn_overworld",
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
          maxPlayers: 20,
          viewDistance: 10,
          simulationDistance: 10,
          reducedDebugInfo: false,
          enableRespawnScreen: false,
          isDebug: false,
          isFlat: false,
        });
        this.sendPacket(joinGameResponse);
        this.sendPacket(
          new PlayClientboundPluginMessage({
            channel: PluginChannel.MINECRAFT_BRAND,
            // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
            data: (() => {
              const b = new MineBuffer();
              b.writeString(this.server.brand);
              return b;
            })(),
          }),
        );
        this.sendPacket(
          new PlayClientboundServerDifficultyMessage({
            difficulty: Difficulty.NORMAL,
            difficultyLocked: false,
          }),
        );
        this.sendPacket(
          new PlayClientboundEntityStatusMessage({
            entityId: this.id,
            status: AllEntityStatus.PLAYER__SET_OP_PERMISSION_4, // TODO: read from config, validate, etc.
          }),
        );
        this.sendPacket(
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
        break;
      }
    }
  }

  protected override _tick(tick: number): void {
    if (this.connection.state === ConnectionState.PLAY) {
      // Process keep alive
      if (this.lastKeepAliveTick === null) {
        this.lastKeepAliveTick = tick;
      } else if (tick - this.lastKeepAliveTick > 20 * 30) {
        this.disconnect("KeepAlive timeout");
      } else if (tick - this.lastKeepAliveTick > 20 * Math.floor(Math.random() * 20)) {
        // this.server.logger.debug(`Sending keepalive to ${this.username}`);
        this.sendPacket(new PlayClientboundKeepAliveMessage({ keepAliveId: BigInt(tick) }));
        this.lastKeepAliveTick = tick;
      }
    }
  }
}
