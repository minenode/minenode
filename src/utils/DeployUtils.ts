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

import fs from "fs";
import path from "path";

/**
 * Returns the application's root directory.
 */
export function getRootDirectory(): string {
  let dirname = __dirname;
  while (!fs.existsSync(path.join(dirname, "package.json"))) {
    if (dirname === path.dirname(dirname)) {
      throw new Error("Could not find root directory");
    }
    dirname = path.dirname(dirname);
  }
  return dirname;
}
