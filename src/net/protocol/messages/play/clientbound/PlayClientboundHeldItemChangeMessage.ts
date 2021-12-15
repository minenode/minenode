import { InventoryHotbarSlot } from "../../../../../utils/Enums";
import MineBuffer from "../../../../../utils/MineBuffer";
import { IClientboundMessage } from "../../../Message";

export interface PlayClientboundHeldItemChangeMessageOptions {
  slot: InventoryHotbarSlot;
}

export class PlayClientboundHeldItemChangeMessage implements IClientboundMessage {
  public id = 0x48;

  public slot: InventoryHotbarSlot;

  public constructor(options: PlayClientboundHeldItemChangeMessageOptions) {
    this.slot = options.slot;
  }

  public encode(buffer: MineBuffer): void {
    buffer.writeByte(this.slot);
  }
}
