import { string, array, boolean, is, enums, number, object, optional, union, lazy, Struct } from "superstruct";

export interface Chat {
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
}

export function isChat(obj: unknown): obj is Chat {
  const ChatSchema: Struct<Chat> = object({
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
  });

  return is(obj, ChatSchema);
}
