import { MineBuffer } from "../../../../../../native/index";
import { encodeNBT } from "../../../../../data/NBT";
import { Vec2 } from "../../../../../utils/Geometry";
import { IClientboundMessage } from "../../../Message";

export interface PlayClientboundChunkDataMessageOptions {
  chunkLocation: Vec2;
  heightMap: { MOTION_BLOCKING: bigint[] };
  data: Uint8Array;
  // TODO:  blockEntities: BlockEntity[];
  trustEdges: boolean;
  skyLightMask: number; // TODO
  blockLightMask: number; // TODO
  emptySkyLightMask: number; // TODO
  skyLight: Uint8Array; // TODO - for now, fill with 2048 1's
  blockLight: Uint8Array; // TODO - for now, fill with 2048 1's
}

export class PlayClientboundChunkDataMessage implements IClientboundMessage {
  public id = 0x22;

  public chunkLocation: Vec2;
  public heightMap: { MOTION_BLOCKING: bigint[] };
  public data: Uint8Array;
  // TODO: public blockEntities: BlockEntity[];
  public trustEdges: boolean;
  public skyLightMask: number; // TODO
  public blockLightMask: number; // TODO
  public emptySkyLightMask: number; // TODO
  public skyLight: Uint8Array; // TODO - for now, fill with 2048 1's
  public blockLight: Uint8Array; // TODO - for now, fill with 2048 1's

  public constructor(options: PlayClientboundChunkDataMessageOptions) {
    this.chunkLocation = options.chunkLocation;
    this.heightMap = options.heightMap;
    this.data = options.data;
    this.trustEdges = options.trustEdges;
    this.skyLightMask = options.skyLightMask;
    this.blockLightMask = options.blockLightMask;
    this.emptySkyLightMask = options.emptySkyLightMask;
    this.skyLight = options.skyLight;
    this.blockLight = options.blockLight;
  }

  public encode(buffer: MineBuffer): void {
    buffer.writeInt(this.chunkLocation.x);
    buffer.writeInt(this.chunkLocation.y);
    // buffer.writeNBT(this.heightMap);
    encodeNBT(buffer, this.heightMap);
    buffer.writeVarInt(this.data.length);
    buffer.writeBytes(Buffer.from(this.data));
    buffer.writeVarInt(0); // TODO: blockEntities
    buffer.writeBoolean(this.trustEdges);
    buffer.writeUByte(this.skyLightMask);
    buffer.writeUByte(this.blockLightMask);
    buffer.writeUByte(this.emptySkyLightMask);
    buffer.writeVarInt(this.skyLight.length);
    buffer.writeBytes(Buffer.from(this.skyLight));
    buffer.writeVarInt(this.blockLight.length);
    buffer.writeBytes(Buffer.from(this.blockLight));
  }
}
