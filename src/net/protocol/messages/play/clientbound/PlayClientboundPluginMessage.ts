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
import { PluginChannel } from "../../../../../utils/Enums";
import { Consumer } from "../../../../../utils/types";
import { IClientboundMessage } from "../../../Message";

export interface PlayClientboundPluginMessageOptions {
  channel: PluginChannel; // TODO: identifier type (lowercase/:)
  data: MineBuffer | Consumer<MineBuffer>; // TODO: Plugin channel data type
}

export class PlayClientboundPluginMessage implements IClientboundMessage {
  public id = 0x18;

  public channel: PluginChannel; // TODO: identifier type (lowercase/:)
  public data: MineBuffer; // TODO: Plugin channel data type

  public constructor(options: PlayClientboundPluginMessageOptions) {
    this.channel = options.channel;
    if (typeof options.data === "function") {
      this.data = new MineBuffer();
      options.data(this.data);
    } else {
      this.data = options.data;
    }
  }

  public encode(buffer: MineBuffer): void {
    buffer.writeString(this.channel);
    buffer.writeBytes(this.data.getBuffer());
  }
}
