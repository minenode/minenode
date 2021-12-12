// Compression.ts - handle symmetric compression state
// Copyright (C) 2021 MineNode
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published
// by the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import * as zlib from "zlib";

export default class CompressionState {
  public threshold = 0;
  public enabled = false;

  public setThreshold(threshold: number): void {
    this.threshold = threshold;
  }

  public compress(buffer: Buffer): Buffer {
    return zlib.inflateSync(buffer);
  }

  public decompress(buffer: Buffer): Buffer {
    return zlib.deflateSync(buffer);
  }
}
