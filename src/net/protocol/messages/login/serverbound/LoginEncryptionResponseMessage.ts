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
import { PlaylientboundPositionAndLookMessage } from "../../play/clientbound/PlayClientboundPositionAndLookMessage";
import PositionYP from "../../../../../utils/geometry/PositionYP";
import { ChatColor } from "../../../../../utils/Chat";

export class LoginEncryptionResponseMessage extends MessageHandler {
  public constructor(server: Server) {
    super({
      state: ConnectionState.LOGIN,
      id: 0x01,
      label: "login encryption response",
      server,
    });
  }

  public handle(buffer: MineBuffer, player: Connection): void {
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

    return player.disconnect(
      `${ChatColor.AQUA}${ChatColor.BOLD}Welcome to MineNode, ${player.username}\n\n${ChatColor.RESET}` +
        `${ChatColor.GREEN}Encryption & zlib Compression OK!\n${ChatColor.RESET}` +
        `${ChatColor.WHITE}Using AES-128-CFB8 symmetric cipher`,
    );

    player.disconnect({
      text: "Welcome to MineNode\n\n",
      color: "aqua",
      extra: [
        {
          text: "Encryption & ZLIB Compression OK!\n",
          color: "green",
        },
        {
          text: `Using AES-128-CFB8 symmetric cipher with shared secret: ${player.encryption.sharedSecret?.toString("hex")}\n\n`,
          color: "white",
        },
        {
          text: "TODO: Authentication (toggleable)",
          color: "yellow",
        },
      ],
    });
    return;

    // TODO: Join Game (requires NBT)

    const successResponse = new LoginSuccessMessage(uuid.v1(), Date.now().toString(32));
    player.writeMessage(successResponse);

    const posResponse = new PlaylientboundPositionAndLookMessage({
      position: new PositionYP(0, 1, 0, 0, 0),
      flags: {
        x: false,
        y: false,
        z: false,
        y_rot: false,
        x_rot: false,
      },
    });
    player.writeMessage(posResponse);
  }
}
