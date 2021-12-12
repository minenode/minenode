// StatusResponseMessae.ts - creates Status Response messages
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

import { Chat } from "/utils/Chat";
import MineBuffer from "/utils/MineBuffer";
import { IClientboundMessage } from "/net/protocol/Message";

export interface StatusResponse {
  version: {
    name: string;
    protocol: number;
  };
  players: {
    max: number;
    online: number;
    sample: { name: string; id: string }[];
  };
  description: Chat;
  favicon?: string;
}

export default class StatusResponseMessage implements IClientboundMessage {
  public id = 0x00;

  public constructor(public statusResponse: StatusResponse) {}

  public encode(buffer: MineBuffer): void {
    buffer.writeString(JSON.stringify(this.statusResponse));
  }
}
