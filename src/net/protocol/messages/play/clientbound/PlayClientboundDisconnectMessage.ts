import { MineBuffer } from "../../../../../../native/index";
import { Chat } from "../../../../../utils/Chat";
import { IClientboundMessage } from "../../../Message";

export interface PlayClientboundDisconnectMessageOptions {
  reason: Chat;
}

export class PlayClientboundDisconnectMessage implements IClientboundMessage {
  public id = 0x1a;

  public reason: Chat;

  public constructor(options: PlayClientboundDisconnectMessageOptions) {
    this.reason = options.reason;
  }

  public encode(buffer: MineBuffer): void {
    buffer.writeString(JSON.stringify(this.reason));
  }
}
