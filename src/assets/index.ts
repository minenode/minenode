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
