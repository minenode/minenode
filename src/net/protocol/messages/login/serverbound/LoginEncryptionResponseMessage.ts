// LoginEncryptionResponseMessage.ts - handle Login Encryption Response messages
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

import * as crypto from "crypto";

import { MessageHandler } from "../../../../../net/protocol/Message";
import Server from "../../../../../server/Server";
import { ConnectionState } from "../../../../../server/Connection";
import MineBuffer from "../../../../../utils/MineBuffer";
import LoginSetCompressionMessage from "../clientbound/LoginSetCompressionMessage";
import LoginSuccessMessage from "../clientbound/LoginSuccessMessage";
import { PlayClientboundPositionAndLookMessage } from "../../play/clientbound/PlayClientboundPositionAndLookMessage";
import { PlayClientboundJoinGameMessage } from "../../play/clientbound/PlayClientboundJoinGameMessage";
import { AllEntityStatus, Difficulty, GameMode, InventoryHotbarSlot, PluginChannel } from "../../../../../utils/Enums";
import { float, int, byte, double } from "../../../../../data/NBT";
import { PlayClientboundPluginMessage } from "../../play/clientbound/PlayClientboundPluginMessage";
import { PlayClientboundServerDifficultyMessage } from "../../play/clientbound/PlayClientboundServerDifficultyMessage";
import { Vec5 } from "../../../../../utils/Geometry";
import { Player } from "../../../../../server/Player";
import { PlayClientboundEntityStatusMessage } from "../../play/clientbound/PlayClientboundEntityStatusMessage";

export class LoginEncryptionResponseMessage extends MessageHandler {
  public constructor(server: Server) {
    super({
      state: ConnectionState.LOGIN,
      id: 0x01,
      label: "login encryption response",
      server,
    });
  }

  public async handle(buffer: MineBuffer, player: Player): Promise<void> {
    const sharedSecretLength = buffer.readVarInt();
    const sharedSecret = buffer.readBytes(sharedSecretLength);
    const verifyTokenLengh = buffer.readVarInt();
    const verifyToken = buffer.readBytes(verifyTokenLengh);

    // Verify verifyToken

    const decryptedSharedSecret = crypto.privateDecrypt({ key: this.server.keypair.privateKey, padding: crypto.constants.RSA_PKCS1_PADDING }, sharedSecret);
    const decryptedVerifyToken = crypto.privateDecrypt({ key: this.server.keypair.privateKey, padding: crypto.constants.RSA_PKCS1_PADDING }, verifyToken);

    if (!decryptedVerifyToken.equals(player.connection.encryption.verifyToken)) {
      // Invalid
      this.server.logger.error(`${player.connection.remote}: Verify token mismatch`);
      return player.disconnect("Verify token mismatch");
    }

    player.connection.encryption.initialize(decryptedSharedSecret);
    player.connection.encryption.enabled = true;

    player.sendPacket(new LoginSetCompressionMessage(this.server.options.compressionThreshold));
    player.connection.compression.enabled = true;

    // TODO: auth

    player.sendPacket(
      new LoginSuccessMessage({
        uuid: player.uuid,
        username: player.username,
      }),
    );

    player.connection.state = ConnectionState.PLAY;

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
                piglin_safe: byte(0), // TODO: implicitly convert boolean to byte
                natural: byte(1),
                ambient_light: float(0.0),
                infiniburn: "minecraft:infiniburn_overworld",
                respawn_anchor_works: byte(0),
                has_skylight: byte(1),
                bed_works: byte(1),
                effects: "minecraft:overworld",
                has_raids: byte(1),
                min_y: int(0),
                height: int(256),
                logical_height: int(256),
                coordinate_scale: double(1.0),
                ultrawarm: byte(0),
                has_ceiling: byte(0),
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
        piglin_safe: byte(0), // TODO: implicitly convert boolean to byte
        natural: byte(1),
        ambient_light: float(0.0),
        infiniburn: "minecraft:infiniburn_overworld",
        respawn_anchor_works: byte(0),
        has_skylight: byte(1),
        bed_works: byte(1),
        effects: "minecraft:overworld",
        has_raids: byte(1),
        min_y: int(0),
        height: int(256),
        logical_height: int(256),
        coordinate_scale: double(1.0),
        ultrawarm: byte(0),
        has_ceiling: byte(0),
      },
      worldName: "minecraft:overworld",
      hashedSeed: 0n,
      maxPlayers: 20,
      viewDistance: 10,
      simulationDistance: 10,
      reducedDebugInfo: false,
      enableRespawnScreen: false,
      isDebug: false,
      isFlat: false,
    });
    player.sendPacket(joinGameResponse);

    await this.server.nextTick();

    player.sendPacket(
      new PlayClientboundServerDifficultyMessage({
        difficulty: Difficulty.NORMAL,
        difficultyLocked: false,
      }),
    );

    player.sendPacket(
      new PlayClientboundPluginMessage({
        channel: PluginChannel.MINECRAFT_BRAND,
        data: new MineBuffer().writeString("MineNode"),
      }),
    );

    player.setHotbarSlot(InventoryHotbarSlot.SLOT_1);

    // TODO: Declare recipes
    // TODO: Tags

    player.sendPacket(
      new PlayClientboundEntityStatusMessage({
        entityId: player.id,
        status: AllEntityStatus.PLAYER__SET_OP_PERMISSION_4, // TODO: read from config, validate, etc.
      }),
    );

    // TODO: Declare commands
    // TODO: Unlock recipes

    player.sendPacket(
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

    // TODO: Player info (Add Player action)
    // TODO: Player info (Update latency action)
    // TODO: Update View Position
    // TODO: Update Light
    // TODO: Chunk Data
    // TODO: World Border
    // TODO: Spawn Position

    // TODO: Move this all out of this class
  }
}
