// LoginEncryptionResponseMessage.ts - handle Login Encryption Response messages
// Copyright (C) 2020 MineNode
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

import { MessageHandler } from "../../../Message";
import Server from "../../../../../server/Server";
import { ConnectionState } from "../../../../../server/Connection";
import MineBuffer from "../../../../../utils/MineBuffer";
import Connection from "../../../../../server/Connection";

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
    if (!this.server.options.encryption || !this.server.keypair || !player.encryption) {
      throw new Error("Login encryption cannot be processed without encryption keys");
    }

    const sharedSecretLength = buffer.readVarInt();
    const sharedSecret = buffer.readBytes(sharedSecretLength);
    const verifyTokenLengh = buffer.readVarInt();
    const verifyToken = buffer.readBytes(verifyTokenLengh);

    // Verify verifyToken

    const decryptedSharedSecret = crypto.publicDecrypt(this.server.keypair.publicKey, sharedSecret);
    const decryptedVerifyToken = crypto.publicDecrypt(this.server.keypair.publicKey, verifyToken);

    if (!decryptedVerifyToken.equals(player.encryption.verifyToken)) {
      // Invalid
      console.error(`[server/ERROR] ${player.remote}: Verify token mismatch`);
      player.disconnect("Verify token mismatch");
    } else {
      player.encryption.sharedSecret = decryptedSharedSecret;
    }
  }
}
