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

import * as uuid from "uuid";

import Server from "./Server";
import { Base } from "../core/Base";

// eslint-disable-next-line @typescript-eslint/ban-types
export abstract class Entity<T> extends Base<T> {
  public readonly id: number;
  public readonly uuid: string;

  public constructor(server: Server) {
    super(server);
    // eslint-disable-next-line @typescript-eslint/dot-notation
    this.id = server["_nextEntityId"]++;
    this.uuid = uuid.v4();
  }
}
