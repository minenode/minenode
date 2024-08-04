/* eslint-disable license-header/header */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { mkdir, readFile, writeFile } from "fs/promises";
import { dirname, join } from "path";
import { Vec2 } from "../../native";
import { Chunk } from "../data/Chunk";
import { WorldStorageProvider } from "../data/WorldStorageProvider";
import { Dimension, WorldFile } from "../world/Dimension";
import { World } from "../world/World";

export interface FSWorldStorageProviderConfig {
  path: string;
}

export class FSWorldStorageProvider extends WorldStorageProvider {
  protected path: string;

  public constructor(config: FSWorldStorageProviderConfig) {
    super();
    this.path = config.path;
  }

  public save(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  public async loadDimensions(world: World): Promise<Dimension[]> {
    try {
      const file = await readFile(join(this.path, `${world.name}.json`), { encoding: "utf-8" });
      const data = JSON.parse(file) as WorldFile;
      return await Promise.resolve(data.dimensions.map(e => Dimension.from(world, e)));
    } catch (error) {}
    return Promise.resolve([]);
  }

  public key(chunkX: number, chunkZ: number): string {
    return new Vec2(chunkX, chunkZ).toString();
  }

  public extractKey(key: string): [string, number, number] {
    const [dimensionUUID, chunkX, chunkZ] = key.split(",");
    return [dimensionUUID, Number(chunkX), Number(chunkZ)];
  }

  public async loadChunk(dimensionUUID: string, chunkX: number, chunkZ: number): Promise<Chunk | null> {
    return this.loadChunkFile(dimensionUUID, chunkX, chunkZ);
  }

  public async saveChunk(dimensionUUID: string, chunkX: number, chunkZ: number, chunk: Chunk): Promise<void> {
    try {
      return await this.saveChunkFile(dimensionUUID, chunkX, chunkZ, chunk);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  // public async saveQueue(dimensionUUID: string): Promise<void> {
  //   const cunksSaves = Array.from(this.queueChunkSave);

  //   console.log(`Saving ${cunksSaves.length} chunks`);

  //   console.log(cunksSaves);
  //   console.log(Array.from(this.chunksLoad.keys()));

  //   const promises: Promise<void>[] = [];
  //   for (const key of cunksSaves) {
  //     const chunk = this.chunksLoad.get(key);
  //     if (chunk) {
  //       console.log(`Chunk ${key} saved`);
  //       const pos = Vec2.fromString(key);
  //       promises.push(this.saveChunkFile(dimensionUUID, pos.x, pos.y, chunk));
  //     }
  //   }
  //   await Promise.all(promises);
  // }

  public async existsChunk(dimensionUUID: string, chunkX: number, chunkZ: number): Promise<boolean> {
    return Promise.resolve(false);
  }

  private async loadChunkFile(dimensionUUID: string, chunkX: number, chunkZ: number): Promise<Chunk | null> {
    const key = this.key(chunkX, chunkZ);
    try {
      const file = await readFile(join(this.path, `${dimensionUUID}`, `${key}.json`), { encoding: "utf-8" });
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const data = JSON.parse(file);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      return Chunk.fromJson(data);
    } catch (error) {
      return Promise.resolve(null);
    }
  }

  private async ensureDirectoryExistence(filePath: string): Promise<void> {
    const dir = dirname(filePath);
    await mkdir(dir, { recursive: true });
  }

  private async saveChunkFile(dimensionUUID: string, chunkX: number, chunkZ: number, chunk: Chunk): Promise<void> {
    const key = this.key(chunkX, chunkZ);
    try {
      const data = chunk.toJson();
      const path = join(this.path, `${dimensionUUID}`, `${key}.json`);
      await this.ensureDirectoryExistence(path);
      return await writeFile(path, JSON.stringify(data), { encoding: "utf-8" });
    } catch (error) {
      return Promise.reject(error);
    }
  }
}
