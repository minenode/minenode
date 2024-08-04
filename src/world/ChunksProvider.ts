/*
 * Copyright (C) 2022 MineNode
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { Player } from "./Player";
import { WithUniqueId } from "./WithUniqueId";
import { World } from "./World";
import { Vec2, Vec3 } from "../../native";
import { Chunk } from "../data/Chunk";
import { WorldStorageProvider } from "../data/WorldStorageProvider";
import {
  PlayClientboundChunkDataMessage,
  PlayClientboundChunkDataMessageOptions,
} from "../net/protocol/messages/play/clientbound/PlayClientboundChunkDataMessage";
import Server from "../server/Server";

export class ChunkProvider implements WithUniqueId {
  public readonly uuid: string;
  public readonly world: World;

  private readonly oldPositions: Map<Player, Vec3> = new Map();

  public readonly chunks: Map<string, Chunk> = new Map();
  public readonly chunksIsUpdating: Set<string> = new Set();
  private readonly loadedChunks: Map<Player, Set<string>> = new Map();

  private readonly chunkRadius: number = 5; // raio de 1 chunk ao redor do jogador
  public constructor(world: World, uuid: string) {
    this.world = world;
    this.uuid = uuid;
  }

  public async saveAllChunks(): Promise<void> {
    await Promise.all(
      Array.from(this.chunks).map(([chunkLocation, chunk]) => {
        const { x, y } = Vec2.fromString(chunkLocation);
        return this.storageProvider.saveChunk(this.uuid, x, y, chunk);
      }),
    );
  }

  // Função para calcular chunks dentro de um raio de uma posição
  private calculateChunksInRadius(center: Vec2): Set<string> {
    const chunks = new Set<string>();
    for (let x = -this.chunkRadius; x <= this.chunkRadius; x++) {
      for (let y = -this.chunkRadius; y <= this.chunkRadius; y++) {
        const chunkX = Math.floor(center.x / 16 + x);
        const chunkY = Math.floor(center.y / 16 + y);
        chunks.add(`${chunkX},${chunkY}`);
      }
    }

    return chunks;
  }

  private getUpdateChunkByPosition(player: Player, position: Vec3) {
    const oldPos = this.oldPositions.get(player);

    if (!oldPos) {
      throw new Error("Old position not found");
    }

    const toLoad: Set<Vec2> = new Set();
    const toUnload: Set<Vec2> = new Set();
    const oldChunks = this.calculateChunksInRadius(oldPos);
    const newChunks = this.calculateChunksInRadius(position);

    // Determine which chunks to load
    newChunks.forEach(chunkStr => {
      if (!oldChunks.has(chunkStr)) {
        const [chunkX, chunkZ] = chunkStr.split(",").map(Number);
        toLoad.add(new Vec2(chunkX, chunkZ));
      }
    });

    // Determine which chunks to unload
    oldChunks.forEach(chunkStr => {
      if (!newChunks.has(chunkStr)) {
        const [chunkX, chunkZ] = chunkStr.split(",").map(Number);
        toUnload.add(new Vec2(chunkX, chunkZ));
      }
    });

    return { toLoad, toUnload };
  }

  /**
   * update chunks around player position
   * @param player
   * @param position
   */
  public async updatePlayerPosition(player: Player, position: Vec3): Promise<void> {
    const newLoadedChunks: Set<Vec2> = new Set();

    if (this.oldPositions.has(player)) {
      const { toLoad, toUnload } = this.getUpdateChunkByPosition(player, position);

      for (const chunkLocation of toUnload) {
        const chunk = this.chunks.get(chunkLocation.toString());
        if (chunk) {
          void this.storageProvider.saveChunk(this.uuid, chunkLocation.x, chunkLocation.y, chunk);
          this.chunks.delete(chunkLocation.toString());
        }
      }

      for (const chunkLocation of toLoad) {
        const chunk = this.chunks.get(chunkLocation.toString());
        if (!chunk) {
          const newChunk = this.createChunk(chunkLocation);
          this.chunks.set(chunkLocation.toString(), newChunk);
          newLoadedChunks.add(chunkLocation);
        }
      }
    } else {
      for (let x = -this.chunkRadius; x <= this.chunkRadius; x++) {
        for (let z = -this.chunkRadius; z <= this.chunkRadius; z++) {
          newLoadedChunks.add(new Vec2(x, z));
        }
      }
    }

    this.oldPositions.set(player, position);

    await this.loadChunks(player, newLoadedChunks);

    this.loadedChunks.set(player, new Set(Array.from(newLoadedChunks).map(v => v.toString())));
  }

  public createChunk = (chunkLocation: Vec2): Chunk => {
    this.server.logger.info(`Gerando novo chunk em ${chunkLocation.toString()}`);
    const chunk = new Chunk({
      minY: -64,
      worldHeight: 384,
    });

    chunk.setSkyLight(new Vec3(8, 4, 8), 15);
    // chunk.renderSkyLight();
    for (let y = 0; y < 2; y++) {
      for (let z = 0; z < 16; z++) {
        for (let x = 0; x < 16; x++) {
          chunk.setBlockStateId(new Vec3(x, y, z), 1);
          if (y === 0) {
            chunk.setBlockStateId(new Vec3(x, y, z), 7);
          }
        }
      }
    }

    return chunk;
  };

  /**
   * Carrega novos chunks para o jogador
   * @param player
   * @param newLoadedChunks
   */
  private async loadChunks(player: Player, newLoadedChunks: Set<Vec2>): Promise<void> {
    const performace = process.hrtime();
    const oldLoadedChunks = this.loadedChunks.get(player) ?? new Set();

    const chunksToLoad = new Set([...newLoadedChunks].filter(x => !oldLoadedChunks.has(x.toString())));

    for (const chunkLocation of chunksToLoad) {
      let chunk = this.chunks.get(chunkLocation.toString()) ?? null;
      if (!chunk) {
        chunk = await this.storageProvider.loadChunk(this.uuid, chunkLocation.x, chunkLocation.y);
      }
      if (!chunk) {
        chunk = this.createChunk(chunkLocation);
      }
      this.chunks.set(chunkLocation.toString(), chunk);
      this.sendChunkData(player, chunkLocation, chunk);
    }

    const diff = process.hrtime(performace);

    const time = diff[0] * 1e3 + diff[1] / 1e6;

    if (time > 1) {
      this.server.logger.warn(`${chunksToLoad.size} chunks carregados em ${time}ms`);
    }
  }

  /**
   * Envia dados do chunk para o jogador
   * @param player
   * @param chunkLocation
   * @param chunk
   */
  private sendChunkData(player: Player, chunkLocation: Vec2, chunk: Chunk): void {
    this.server.logger.info(`Enviando dados do chunk para ${player.username} em ${chunkLocation.toString()}`);
    const chunkDataPacket: PlayClientboundChunkDataMessageOptions = {
      chunkLocation,
      heightMap: {
        MOTION_BLOCKING: new Array(37).fill(1).map(() => BigInt(0n)),
        WORLD_SURFACE: new Array(37).fill(1).map(() => BigInt(0n)),
      },
      data: chunk,
      trustEdges: false,
    };
    const pp = new PlayClientboundChunkDataMessage(chunkDataPacket);
    void player.connection.writeMessage(pp);
  }
  // Convenience methods

  public get storageProvider(): WorldStorageProvider {
    return this.world.worldStorageProvider;
  }

  public get server(): Server {
    return this.world.server;
  }
}
