// Player.ts - Base class for player, with networking, world events, etc.
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

import { EventEmitter } from "eventemitter3";
import ConnectionHandler from "../net/ConnectionHandler";
import Server from "./Server";

export default class Player extends EventEmitter {
  public connection: ConnectionHandler;
  public server: Server;

  public constructor(server: Server, connection: ConnectionHandler) {
    super();
    this.connection = connection;
    this.server = server;
  }
}
