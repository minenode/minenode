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
import Connection from "../../../../../server/Connection";
import LoginSetCompressionMessage from "../clientbound/LoginSetCompressionMessage";
import LoginSuccessMessage from "../clientbound/LoginSuccessMessage";
import * as uuid from "uuid";
import { PlayClientboundPositionAndLookMessage } from "../../play/clientbound/PlayClientboundPositionAndLookMessage";
import PositionYP from "../../../../../utils/geometry/PositionYP";
import { PlayClientboundJoinGameMessage } from "../../play/clientbound/PlayClientboundJoinGameMessage";
import { GameMode } from "../../../../../utils/DataTypes";
import { float, int, byte, double } from "../../../../../data/NBT";

export class LoginEncryptionResponseMessage extends MessageHandler {
  public constructor(server: Server) {
    super({
      state: ConnectionState.LOGIN,
      id: 0x01,
      label: "login encryption response",
      server,
    });
  }

  public async handle(buffer: MineBuffer, player: Connection): Promise<void> {
    const sharedSecretLength = buffer.readVarInt();
    const sharedSecret = buffer.readBytes(sharedSecretLength);
    const verifyTokenLengh = buffer.readVarInt();
    const verifyToken = buffer.readBytes(verifyTokenLengh);

    // Verify verifyToken

    const decryptedSharedSecret = crypto.privateDecrypt({ key: this.server.keypair.privateKey, padding: crypto.constants.RSA_PKCS1_PADDING }, sharedSecret);
    const decryptedVerifyToken = crypto.privateDecrypt({ key: this.server.keypair.privateKey, padding: crypto.constants.RSA_PKCS1_PADDING }, verifyToken);

    if (!decryptedVerifyToken.equals(player.encryption.verifyToken)) {
      // Invalid
      this.server.logger.error(`${player.remote}: Verify token mismatch`);
      return player.disconnect("Verify token mismatch");
    }

    player.encryption.initialize(decryptedSharedSecret);
    player.encryption.enabled = true;

    const compressionResponse = new LoginSetCompressionMessage(this.server.options.compressionThreshold);
    player.writeMessage(compressionResponse);
    player.compression.enabled = true;

    // TODO: auth

    // return player.disconnect(
    //   `${ChatColor.AQUA}${ChatColor.BOLD}Welcome to MineNode, ${player.username}\n\n${ChatColor.RESET}` +
    //     `${ChatColor.GREEN}Encryption & zlib Compression OK!\n${ChatColor.RESET}` +
    //     `${ChatColor.WHITE}Using AES-128-CFB8 symmetric cipher`,
    // );

    const successResponse = new LoginSuccessMessage(uuid.v1(), player.username ?? "");
    player.writeMessage(successResponse);

    player.state = ConnectionState.PLAY;

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
    player.writeMessage(joinGameResponse);

    await this.server.nextTick();

    const posResponse = new PlayClientboundPositionAndLookMessage({
      position: new PositionYP(0, 1, 0, 0, 0),
      flags: {
        x: false,
        y: false,
        z: false,
        y_rot: false,
        x_rot: false,
      },
      teleportId: 69,
      dismountVehicle: false,
    });
    player.writeMessage(posResponse);
  }
}
