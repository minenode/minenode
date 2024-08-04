/* eslint-disable license-header/header */

import { Chunk } from "./Chunk";
import { Dimension } from "../world/Dimension";
import { World } from "../world/World";

export abstract class WorldStorageProvider {
  // protected readonly queueChunkSave: Set<string> = new Set();
  // public readonly chunksLoad: Map<string, Chunk> = new Map();

  public abstract loadDimensions(world: World): Promise<Dimension[]>;
  // saveDimension(): Promise<void>;
  public abstract saveChunk(dimensionUUID: unknown, chunkX: number, chunkZ: number, chunk: Chunk): Promise<void>;

  public abstract loadChunk(dimensionUUID: unknown, chunkX: number, chunkZ: number): Promise<Chunk | null>;
  public abstract existsChunk(dimensionUUID: unknown, chunkX: number, chunkZ: number): Promise<boolean>;

  public abstract save(): Promise<void>;
}
