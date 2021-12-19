import { IClientboundMessage } from "../../../Message";
import { Tag, TagType, TagIdentifier } from "../../../../../utils/Tags";
import { MineBuffer } from "../../../../../../native/index";

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
