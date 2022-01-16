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

import { MineBuffer } from "../../../../../../native";
import { Chat } from "../../../../../utils/Chat";
import { ClientChatPosition } from "../../../../../utils/Enums";
import { IClientboundMessage } from "../../../Message";

export interface PlayClientboundChatMessageOptions {
  chat: Chat;
  position: ClientChatPosition;
  sender: string | null;
}

export class PlayClientboundChatMessage implements IClientboundMessage {
  public id = 0x0f;

  public chat: Chat;
  public position: ClientChatPosition;
  public sender: string | null; // UUID - set to null/0 will always display

  public constructor(options: PlayClientboundChatMessageOptions) {
    this.chat = options.chat;
    this.position = options.position;
    this.sender = options.sender;
  }

  public encode(buffer: MineBuffer): void {
    buffer.writeString(JSON.stringify(this.chat));
    buffer.writeByte(this.position);
    buffer.writeUUID(this.sender ?? "00000000-0000-0000-0000-000000000000");
  }
}
