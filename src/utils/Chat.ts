// Chat.ts - Chat formatting, types and utilities
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

import chalk from "chalk";
import { string, array, boolean, is, enums, number, object, optional, union, lazy, Struct } from "superstruct";

export const FORMAT_CHAR = "§";

export type Chat =
  | string
  | {
      text: string;
      bold?: boolean;
      italic?: boolean;
      underlined?: boolean;
      strikethrough?: boolean;
      obfuscated?: boolean;
      color?: ChatColor | ChatColorType;
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
  ]) as Struct<Chat>; // TODO: This is a hack to stop TS from complaining about the union type.

  return is(obj, ChatSchema);
}

export type ChatColorType =
  | "black"
  | "dark_blue"
  | "dark_green"
  | "dark_aqua"
  | "dark_red"
  | "dark_purple"
  | "gold"
  | "gray"
  | "dark_gray"
  | "blue"
  | "green"
  | "aqua"
  | "red"
  | "light_purple"
  | "yellow"
  | "white";

export enum ChatColor {
  // Colors
  BLACK = "§0",
  DARK_BLUE = "§1",
  DARK_GREEN = "§2",
  DARK_AQUA = "§3",
  DARK_RED = "§4",
  DARK_PURPLE = "§5",
  GOLD = "§6",
  GRAY = "§7",
  DARK_GRAY = "§8",
  BLUE = "§9",
  GREEN = "§a",
  AQUA = "§b",
  RED = "§c",
  LIGHT_PURPLE = "§d",
  YELLOW = "§e",
  WHITE = "§f",
  // Formatting
  OBFUSCATED = "§k",
  BOLD = "§l",
  STRIKETHROUGH = "§m",
  UNDERLINE = "§n",
  ITALIC = "§o",
  RESET = "§r",
}

export function formatChat(text: string, delimiter = "&"): string {
  const d = delimiter.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
  return text.replace(new RegExp(`${d}([0123456789abcdefklmnor])`, "g"), `${FORMAT_CHAR}$1`);
}

export function consoleFormatChat(chat: Chat): string {
  let format = chalk.reset;
  let result = "";
  // coerce chat to a string
  let chatString = "";
  if (typeof chat === "object") {
    for (const node of [chat, ...(chat.extra || [])]) {
      if (typeof node === "string") chatString += node;
      else {
        if (node.bold) chatString += ChatColor.BOLD;
        if (node.underlined) chatString += ChatColor.UNDERLINE;
        if (node.strikethrough) chatString += ChatColor.STRIKETHROUGH;
        if (node.italic) chatString += ChatColor.ITALIC;
        if (node.obfuscated) chatString += ChatColor.OBFUSCATED;
        if (node.color) {
          switch (node.color) {
            case ChatColor.BLACK:
            case ChatColor.DARK_BLUE:
            case ChatColor.DARK_GREEN:
            case ChatColor.DARK_AQUA:
            case ChatColor.DARK_RED:
            case ChatColor.DARK_PURPLE:
            case ChatColor.GOLD:
            case ChatColor.GRAY:
            case ChatColor.DARK_GRAY:
            case ChatColor.BLUE:
            case ChatColor.GREEN:
            case ChatColor.AQUA:
            case ChatColor.RED:
            case ChatColor.LIGHT_PURPLE:
            case ChatColor.YELLOW:
            case ChatColor.WHITE:
              chatString += node.color;
              break;
            case ChatColor.OBFUSCATED:
            case ChatColor.BOLD:
            case ChatColor.STRIKETHROUGH:
            case ChatColor.UNDERLINE:
            case ChatColor.ITALIC:
            case ChatColor.RESET:
              throw new TypeError("Cannot use ChatColor format types in chat object color property");
            default:
              chatString += {
                black: ChatColor.BLACK,
                dark_blue: ChatColor.DARK_BLUE,
                dark_green: ChatColor.DARK_GREEN,
                dark_aqua: ChatColor.DARK_AQUA,
                dark_red: ChatColor.DARK_RED,
                dark_purple: ChatColor.DARK_PURPLE,
                gold: ChatColor.GOLD,
                gray: ChatColor.GRAY,
                dark_gray: ChatColor.DARK_GRAY,
                blue: ChatColor.BLUE,
                green: ChatColor.GREEN,
                aqua: ChatColor.AQUA,
                red: ChatColor.RED,
                light_purple: ChatColor.LIGHT_PURPLE,
                yellow: ChatColor.YELLOW,
                white: ChatColor.WHITE,
              }[node.color];
              break;
          }
        }
        chatString += node.text;
      }
    }
  } else {
    chatString = chat;
  }

  // parse chat
  parse: while (chatString.length > 0) {
    let slice = chatString;
    for (const formatCode of [
      // Color
      ChatColor.BLACK,
      ChatColor.DARK_BLUE,
      ChatColor.DARK_GREEN,
      ChatColor.DARK_AQUA,
      ChatColor.DARK_RED,
      ChatColor.DARK_PURPLE,
      ChatColor.GOLD,
      ChatColor.GRAY,
      ChatColor.DARK_GRAY,
      ChatColor.BLUE,
      ChatColor.GREEN,
      ChatColor.AQUA,
      ChatColor.RED,
      ChatColor.LIGHT_PURPLE,
      ChatColor.YELLOW,
      ChatColor.WHITE,
      // Format
      ChatColor.OBFUSCATED,
      ChatColor.BOLD,
      ChatColor.STRIKETHROUGH,
      ChatColor.UNDERLINE,
      ChatColor.ITALIC,
      ChatColor.RESET,
    ]) {
      if (chatString.substring(0, formatCode.length) === formatCode) {
        format = {
          [ChatColor.BLACK]: format.hex("#000000"),
          [ChatColor.DARK_BLUE]: format.hex("#0000AA"),
          [ChatColor.DARK_GREEN]: format.hex("#00AA00"),
          [ChatColor.DARK_AQUA]: format.hex("#00AAAA"),
          [ChatColor.DARK_RED]: format.hex("#AA0000"),
          [ChatColor.DARK_PURPLE]: format.hex("#AA00AA"),
          [ChatColor.GOLD]: format.hex("#FFAA00"),
          [ChatColor.GRAY]: format.hex("#AAAAAA"),
          [ChatColor.DARK_GRAY]: format.hex("#555555"),
          [ChatColor.BLUE]: format.hex("#5555FF"),
          [ChatColor.GREEN]: format.hex("#55FF55"),
          [ChatColor.AQUA]: format.hex("#55FFFF"),
          [ChatColor.RED]: format.hex("#FF5555"),
          [ChatColor.LIGHT_PURPLE]: format.hex("#FF55FF"),
          [ChatColor.YELLOW]: format.hex("#FFFF55"),
          [ChatColor.WHITE]: format.hex("#FFFFFF"),
          [ChatColor.OBFUSCATED]: format.hidden,
          [ChatColor.BOLD]: format.bold,
          [ChatColor.STRIKETHROUGH]: format.strikethrough,
          [ChatColor.UNDERLINE]: format.underline,
          [ChatColor.ITALIC]: format.italic,
          [ChatColor.RESET]: format.reset,
        }[formatCode];
        chatString = chatString.substring(formatCode.length);
        continue parse;
      } else {
        if (slice.includes(formatCode)) {
          slice = slice.substring(0, slice.indexOf(formatCode));
        }
      }
    }
    result += format(slice);
    chatString = chatString.substring(slice.length);
  }

  return result;
}
