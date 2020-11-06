// app.ts - Main CLI entrypoint for the server
// Copyright (C) 2020 MineNode
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

import Server from "./server/Server";

import * as fs from "fs";
import * as path from "path";
import * as yaml from "js-yaml";
import * as appRoot from "app-root-path";
import { assert, object, number, string } from "superstruct";

const configFilePath = path.resolve(appRoot.path, "config.yml");
if (!fs.existsSync(configFilePath)) {
  fs.writeFileSync(
    configFilePath,
    yaml.safeDump({
      compressionThreshold: 256,
      motd: "A Minecraft Server",
      maxPlayers: 5,
      favicon: "",
    }),
    "utf8",
  );
}
const configRaw = fs.readFileSync(configFilePath, "utf8");
const config = yaml.safeLoad(configRaw);

assert(
  config,
  object({
    compressionThreshold: number(),
    motd: string(),
    maxPlayers: number(),
    favicon: string(),
  }),
);

const server = new Server(config);
server.start();
