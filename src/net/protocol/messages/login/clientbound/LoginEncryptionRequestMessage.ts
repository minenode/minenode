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

import { MineBuffer } from "../../../../../../native/index";
import { IClientboundMessage } from "../../../../../net/protocol/Message";

export default class LoginEncryptionRequestMessage implements IClientboundMessage {
  public id = 0x01;

  public serverID: string;
  public publicKey: Buffer;
  public verifyToken: Buffer;

  public constructor(options: { serverID: string; publicKey: Buffer; verifyToken: Buffer }) {
    this.serverID = options.serverID;
    this.publicKey = options.publicKey;
    this.verifyToken = options.verifyToken;
  }

  public encode(buffer: MineBuffer): void {
    buffer.writeString(this.serverID);
    buffer.writeVarInt(this.publicKey.length);
    buffer.writeBytes(this.publicKey);
    buffer.writeVarInt(this.verifyToken.length);
    buffer.writeBytes(this.verifyToken);
  }
}
