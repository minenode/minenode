import { MineBuffer } from "../../../../../../native";
import { Chat } from '../../../../../utils/Chat';
import { ClientChatPosition } from '../../../../../utils/Enums';
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
