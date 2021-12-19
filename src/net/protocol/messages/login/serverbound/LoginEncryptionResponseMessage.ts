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
import LoginSetCompressionMessage from "../clientbound/LoginSetCompressionMessage";
import LoginSuccessMessage from "../clientbound/LoginSuccessMessage";
import { Player } from "../../../../../server/Player";
import { MineBuffer } from "../../../../../../native/index";

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

    await player.setState(ConnectionState.PLAY);

    // TODO: Declare recipes
    // TODO: Tags
    // TODO: Declare commands
    // TODO: Unlock recipes

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
