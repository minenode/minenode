// Message.ts - Base classes and interfaces for protocol messages
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

import MineBuffer from "../../utils/minebuffer";

export interface MessageHandlerOptions {
  id: number;
  label: string;
}

export abstract class MessageHandler {
  public readonly id: number;
  public readonly label: string;

  public constructor(options: MessageHandlerOptions) {
    this.id = options.id;
    this.label = options.label;
  }

  public abstract handle(buffer: MineBuffer): void | Promise<void>;
}
