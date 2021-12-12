// Message.ts - Base classes and interfaces for protocol messages
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

import Server from "/server/Server";
import Player from "/server/Player";
import MineBuffer from "/utils/MineBuffer";
import Connection, { ConnectionState } from "/server/Connection";

export interface MessageHandlerOptions {
  state: ConnectionState;
  id: number;
  label: string;
  server: Server;
}

export abstract class MessageHandler {
  public readonly state: ConnectionState;
  public readonly id: number;
  public readonly label: string;
  public readonly server: Server;

  public constructor(options: MessageHandlerOptions) {
    this.state = options.state;
    this.id = options.id;
    this.label = options.label;
    this.server = options.server;
  }

  public abstract handle(buffer: MineBuffer, player: Connection | Player): void;
}

export interface IClientboundMessage {
  id: number;
  encode(buffer: MineBuffer): void;
}
