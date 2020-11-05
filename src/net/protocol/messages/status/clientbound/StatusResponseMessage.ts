import { Chat } from "../../../../../utils/DataTypes";
import MineBuffer from "../../../../../utils/MineBuffer";
import { IClientboundMessage } from "../../../Message";

export interface StatusResponse {
  version: {
    name: string;
    protocol: number;
  };
  players: {
    max: number;
    online: number;
    sample: { name: string; id: string }[];
  };
  description: Chat;
  favicon?: string;
}

export default class StatusResponseMessage implements IClientboundMessage {
  public id = 0x00;

  public constructor(public statusResponse: StatusResponse) {}

  public encode(buffer: MineBuffer): void {
    buffer.writeString(JSON.stringify(this.statusResponse));
  }
}
