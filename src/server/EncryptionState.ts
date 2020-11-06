// EncryptionState.ts - handle symmetric encryption state
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

export default class EncryptionState {
  public verifyToken: Buffer = crypto.randomBytes(4);

  public sharedSecret?: Buffer;
  public cipher?: crypto.Cipher;
  public decipher?: crypto.Decipher;

  public constructor(public serverKeypair: crypto.KeyPairKeyObjectResult) {}

  public initialize(sharedSecret: Buffer): void {
    if (sharedSecret.length !== 16) {
      throw new Error("shared secret must be exactly 16 bytes");
    }
    this.sharedSecret = sharedSecret.slice();
    this.cipher = crypto.createCipheriv("aes-128-cfb8", this.sharedSecret, this.sharedSecret);
    this.decipher = crypto.createDecipheriv("aes-128-cfb8", this.sharedSecret, this.sharedSecret);
  }

  public updateCipher(data: Buffer): Buffer {
    if (this.cipher) {
      return this.cipher.update(data);
    } else {
      throw new Error("EncryptionState.update called before cipher was initiailized");
    }
  }

  public updateDecipher(data: Buffer): Buffer {
    if (this.decipher) {
      return this.decipher.update(data);
    } else {
      throw new Error("EncryptionState.update called before cipher was initiailized");
    }
  }
}
