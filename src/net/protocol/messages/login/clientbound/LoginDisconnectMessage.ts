import { IClientboundMessage } from "../../../Message";
import { Chat } from "../../../../../utils/DataTypes";
import MineBuffer from "../../../../../utils/MineBuffer";

export default class LoginDisconnectMessage implements IClientboundMessage {
  public id = 0x00;

  public constructor(public reason: Chat) {}

  public encode(buffer: MineBuffer): void {
    buffer.writeChat(this.reason);
  }
}
