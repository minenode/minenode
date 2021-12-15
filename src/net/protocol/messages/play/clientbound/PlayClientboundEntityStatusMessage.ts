import { IClientboundMessage } from "../../../Message";
import { AllEntityStatus } from "../../../../../utils/Enums";
import MineBuffer from "../../../../../utils/MineBuffer";

export interface PlayClientboundEntityStatusMessageOptions {
  entityId: number;
  status: AllEntityStatus;
}

export class PlayClientboundEntityStatusMessage implements IClientboundMessage {
  public id = 0x1b;

  public entityId: number;
  public status: AllEntityStatus;

  public constructor(options: PlayClientboundEntityStatusMessageOptions) {
    this.entityId = options.entityId;
    this.status = options.status;
  }

  public encode(buffer: MineBuffer): void {
    buffer.writeInt(this.entityId);
    buffer.writeByte(this.status);
  }
}
