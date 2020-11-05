import * as Long from "long";

import { IClientboundMessage } from "../../../Message";
import MineBuffer from "../../../../../utils/MineBuffer";

export default class StatusPongMessage implements IClientboundMessage {
  public id = 0x01;

  public constructor(public payload: Long) {}

  public encode(buffer: MineBuffer): void {
    buffer.writeLong(this.payload);
  }
}
