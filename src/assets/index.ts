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

export const MINECRAFT_VERSION = "1.18";

import _blocks from "./blocks.json";

type DeepReadonly<T> = { readonly [P in keyof T]: DeepReadonly<T[P]> };

export const blocks: DeepReadonly<typeof _blocks> = _blocks;

export interface BlockState<
  K extends keyof typeof blocks = keyof typeof blocks,
  S extends typeof blocks[K]["states"][number] = typeof blocks[K]["states"][number],
> {
  name: K;
  block: typeof blocks[K];
  state: S;
}

// const blocksById = new Map<number, BlockState>();
// for (const [name, block] of Object.entries(blocks)) {
//   for (const stateData of Object.values(block.states)) {
//     blocksById.set(stateData.id, {
//       name,
//       block,
//       state: stateData,
//     });
//   }
// }
// export function getBlockById(id: number): BlockState {
//   return blocksById.get(id) as BlockState;
// }

// const blocksById = new Map < ["states"][number]["id"], {
//   block: typeof blocks[keyof typeof blocks]> ();
