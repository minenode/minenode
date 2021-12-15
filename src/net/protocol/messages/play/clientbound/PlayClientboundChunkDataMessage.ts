import { IClientboundMessage } from "../../../Message";
import { Vec2 } from "../../../../../utils/Geometry";
import MineBuffer from "../../../../../utils/MineBuffer";

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
    buffer
      .writeInt(this.chunkLocation.x)
      .writeInt(this.chunkLocation.y)
      .writeNBT(this.heightMap)
      .writeVarInt(this.data.length)
      .writeBytes(this.data)
      .writeVarInt(0) // TODO: blockEntities
      .writeBoolean(this.trustEdges)
      .writeUByte(this.skyLightMask)
      .writeUByte(this.blockLightMask)
      .writeUByte(this.emptySkyLightMask)
      .writeVarInt(this.skyLight.length)
      .writeBytes(this.skyLight)
      .writeVarInt(this.blockLight.length)
      .writeBytes(this.blockLight);
  }
}
