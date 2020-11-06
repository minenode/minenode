import { IClientboundMessage } from "../../../Message";
import MineBuffer from "../../../../../utils/MineBuffer";

export default class LoginSuccessMessage implements IClientboundMessage {
  public id = 0x02;

  public constructor(public uuid: string, public username: string) {}

  public encode(buffer: MineBuffer): void {
    buffer.writeUUID(this.uuid).writeString(this.username);
  }
}
