import { IClientboundMessage } from "../../../Message";
import { MineBuffer } from "../../../../../../native/index";

export interface PlayClientboundKeepAliveMessageOptions {
  keepAliveId: bigint;
}

export class PlayClientboundKeepAliveMessage implements IClientboundMessage {
  public id = 0x21;

  public keepAliveId: bigint;

  public constructor(options: PlayClientboundKeepAliveMessageOptions) {
    this.keepAliveId = options.keepAliveId;
  }

  public encode(buffer: MineBuffer): void {
    buffer.writeLong(this.keepAliveId);
  }
}
