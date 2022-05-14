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
import { Tag, TagType, TagIdentifier } from "../../../../../data/Tags";
import { IClientboundMessage } from "../../../Message";

export interface PlayClientboundTagsMessageOptions {
  tags: Record<TagIdentifier, Record<TagType, Tag[]>>;
}

export class PlayClientboundTagsMessage implements IClientboundMessage {
  public id = 0x67;

  public tagRegistry: Record<TagIdentifier, Record<TagType, Tag[]>>;

  public constructor(options: PlayClientboundTagsMessageOptions) {
    this.tagRegistry = options.tags;
  }

  public encode(buffer: MineBuffer): void {
    const entries = Object.entries(this.tagRegistry);
    buffer.writeVarInt(entries.length);
    for (const [identifier, types] of entries) {
      buffer.writeString(identifier);
      buffer.writeVarInt(Object.keys(types).length);
      for (const [type, tags] of Object.entries(types)) {
        buffer.writeString(type);
        buffer.writeVarInt(tags.length);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for (const tag of tags) {
          throw new Error("Not implemented");
          // buffer.writeVarInt(0);
          // TODO: "Numeric ID of the given type (block, item, etc.)"
        }
      }
    }
  }
}
