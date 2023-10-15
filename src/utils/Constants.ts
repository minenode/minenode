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

export const MINENODE_VERSION = "0.0.0";
export const PROTOCOL_VERSION = 758;
export const GAME_VERSION = "1.18.2";

// height in blocks of a chunk column
export const CHUNK_HEIGHT = 256;

// width in blocks of a chunk column
export const CHUNK_WIDTH = 16;

// height in blocks of a chunk section
export const SECTION_HEIGHT = 16;

// width in blocks of a chunk section
export const SECTION_WIDTH = 16;

// volume in blocks of a chunk section
export const BLOCK_SECTION_VOLUME = SECTION_HEIGHT * SECTION_WIDTH * SECTION_WIDTH;

// number of chunk sections in a chunk column
export const NUM_SECTIONS = 16;

// minimum number of bits per block allowed when using the section palette.
export const MIN_BITS_PER_BLOCK = 4;

// maximum number of bits per block allowed when using the section palette.
// values above will switch to global palette
export const MAX_BITS_PER_BLOCK = 8;

// number of bits used for each block in the global palette.
// this value should not be hardcoded according to wiki.vg
export const GLOBAL_BITS_PER_BLOCK = 16;

export const BIOME_SECTION_VOLUME = (BLOCK_SECTION_VOLUME / (4 * 4 * 4)) | 0;

export const MIN_BITS_PER_BIOME = 1;

export const MAX_BITS_PER_BIOME = 3;

export const GLOBAL_BITS_PER_BIOME = 6; // height in blocks of a chunk column
