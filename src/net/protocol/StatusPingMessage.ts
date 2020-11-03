// StatusPingMessage.ts - handle status ping messages
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

import Server from "../../server/Server";
import MineBuffer from "../../utils/MineBuffer";
import Connection from "../Connection";
import { MessageHandler } from "./Message";

export class StatusPingMessageHandler extends MessageHandler {
  public constructor(server: Server, state: number, id: number) {
    super({
      state: state,
      id: id,
      label: "status request",
      server: server,
    });
  }

  public handle(buffer: MineBuffer, player: Connection): void {
    const payload = buffer.readLong();
    const responseBuffer = new MineBuffer();
    responseBuffer.writeLong(payload);
    player.write(1, responseBuffer);
    console.log(`[server] status ping (payload = ${payload}) from ${player.remote}`);
  }
}
