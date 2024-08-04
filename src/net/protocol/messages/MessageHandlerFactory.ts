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

import path from "path";
import { globSync } from "glob";
import { ConnectionState } from "../../../server/Connection";
import Server from "../../../server/Server";
import { MessageHandler } from "../Message";

export default class MessageHandlerFactory {
  public readonly registered: Set<MessageHandler> = new Set();

  public constructor(public readonly server: Server) {
    const messagesFiles = globSync("src/net/protocol/messages/**/*.ts", {
      ignore: ["./MessageHandlerFactory.ts"],
    });

    const messagesModules = messagesFiles
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
      .map(file => require(path.resolve(file))?.selfRegisterMessageHandler as ((server: Server) => MessageHandler) | undefined);

    messagesModules.forEach(moduleHandles => {
      if (moduleHandles) this.registered.add(moduleHandles(this.server));
    });
  }

  public getHandler(id: number, state: ConnectionState): MessageHandler | null {
    for (const handler of this.registered) {
      if (handler.state === state && handler.id === id) return handler;
    }
    return null;
  }
}
