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

import * as uuidlib from "uuid";
import { Dimension, DimensionMember } from "./Dimension";
import { Tickable } from "./Tickable";
import { WithUniqueId } from "./WithUniqueId";
import { World } from "./World";
import Server from "../server/Server";

export abstract class Entity implements Tickable, DimensionMember, WithUniqueId {
  public static RUNTIME_ID = 0;

  public readonly dimension: Dimension;
  public readonly entityId: number;
  public readonly uuid: string;

  public constructor(dimension: Dimension, entityId: number, uuid: string = uuidlib.v4()) {
    this.dimension = dimension;
    this.entityId = entityId;
    this.uuid = uuid;
  }

  public abstract init(): void | Promise<void>;

  public abstract tick(tick: number): void | Promise<void>;

  public abstract end(): void | Promise<void>;

  // Convenience methods

  public get world(): World {
    return this.dimension.world;
  }

  public get server(): Server {
    return this.dimension.world.server;
  }
}
