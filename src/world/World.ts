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

import { Dimension } from "./Dimension";
import { Player } from "./Player";
import { Tickable } from "./Tickable";
import Server from "../server/Server";
import { Difficulty } from "../utils/Enums";
import { parallel } from "../utils/SetUtils";

export interface WorldOptions {
  difficulty?: Difficulty;
  difficultyLocked?: boolean;
  isHardcore?: boolean;
}

export class World implements Tickable {
  public readonly server: Server;
  public readonly dimensions: Set<Dimension> = new Set();

  private _difficulty: Difficulty;
  public readonly difficultyLocked: boolean;
  public readonly isHardcore: boolean;

  public get difficulty(): Difficulty {
    return this._difficulty;
  }

  public set difficulty(difficulty: Difficulty) {
    if (this.difficultyLocked) {
      throw new Error("Difficulty is locked");
    }
    this._difficulty = difficulty;
    void parallel(this.players(), player => player.sendDifficulty(difficulty));
  }

  public constructor(server: Server, options: WorldOptions = {}) {
    this.server = server;
    this._difficulty = options.difficulty ?? Difficulty.NORMAL;
    this.difficultyLocked = options.difficultyLocked ?? false;
    this.isHardcore = options.isHardcore ?? false;
  }

  public init(): void {
    void 0;
  }

  public end(): void {
    void 0;
  }

  public async tick(tick: number): Promise<void> {
    await Promise.resolve(void tick);
  }

  // Convenience methods

  public *players(): Iterable<Player> {
    for (const dimension of this.dimensions) {
      for (const player of dimension.players) {
        yield player;
      }
    }
  }

  public getDimension(name: string): Dimension | undefined {
    for (const dimension of this.dimensions) {
      if (dimension.name === name) {
        return dimension;
      }
    }
    return undefined;
  }
}

export interface WorldMember {
  readonly world: World;
}
