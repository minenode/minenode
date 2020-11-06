// DataTypes.ts - defines and interacts with various data types
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

import { string, array, boolean, is, enums, number, object, optional, union, lazy, Struct } from "superstruct";

export type Chat =
  | string
  | {
      text: string;
      bold?: boolean;
      italic?: boolean;
      underlined?: boolean;
      strikethrough?: boolean;
      obfuscated?: boolean;
      color?: string;
      insertion?: string;
      clickEvent?: {
        action: "open_url" | "run_command" | "suggest_command" | "change_page";
        value: string | number;
      };
      hoverEvent?: {
        action: "show_text" | "show_item" | "show_entity";
        value: string;
      };
      extra?: Chat[];
    };

export function isChat(obj: unknown): obj is Chat {
  const ChatSchema: Struct<Chat> = union([
    string(),
    object({
      text: string(),
      bold: optional(boolean()),
      italic: optional(boolean()),
      underlined: optional(boolean()),
      strikethrough: optional(boolean()),
      obfuscated: optional(boolean()),
      color: optional(string()),
      insertion: optional(string()),
      clickEvent: optional(
        object({
          action: enums(["open_url", "run_command", "suggest_command", "change_page"]),
          value: union([number(), string()]),
        }),
      ),
      hoverEvent: optional(
        object({
          action: enums(["show_text", "show_item", "show_entity"]),
          value: union([number(), string()]),
        }),
      ),
      extra: optional(array(lazy(() => ChatSchema))),
    }),
  ]);

  return is(obj, ChatSchema);
}
