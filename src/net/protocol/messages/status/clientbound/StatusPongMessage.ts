// StatusPongMessage.ts - creates Status Pong messages
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

import { IClientboundMessage } from "../../../../../net/protocol/Message";
import MineBuffer from "../../../../../utils/MineBuffer";

export default class StatusPongMessage implements IClientboundMessage {
  public id = 0x01;

  public constructor(public payload: bigint) {}

  public encode(buffer: MineBuffer): void {
    buffer.writeLong(this.payload);
  }
}
