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

import { MineBuffer } from "../../../../../../native";
import { ConnectionState } from "../../../../../server/Connection";
import { Player } from "../../../../../server/Player";
import Server from "../../../../../server/Server";
import { ClientChatPosition } from "../../../../../utils/Enums";
import { MessageHandler } from "../../../Message";

export class PlayServerboundChatMessage extends MessageHandler {
  public constructor(server: Server) {
    super({
      state: ConnectionState.PLAY,
      id: 0x03,
      label: "chat",
      server,
    });
  }

  public handle(buffer: MineBuffer, player: Player): void {
    let message = buffer.readString();

    if (message.length > 256) {
      player.disconnect("Invalid chat message");
      return;
    }

    message = message.replace(/\u0000/g, "").trim();
    if (message.length === 0) {
      this.server.logger.warn(`${player.username} tried to send an empty chat message`);
      return;
    }

    if (message.startsWith("/")) {
      // TODO: proper command handling
      const tokens = message.substring(1).split(/\s+/g);
      const command = tokens.shift();

      switch (command?.toLowerCase()) {
        case "help":
          player.sendChat({
            text: "Available commands:\n",
            extra: [
              "/help - show this message\n",
              "/list - list online players\n",
              "/msg <player> <message> - send a private message\n",
              "/me <message> - send an action message\n",
              "/stop - stop the server\n",
            ],
          });
          break;
        case "list":
          player.sendChat({
            text: `Online players (${[...this.server.players].filter(p => p.connection.state === ConnectionState.PLAY).length}):\n`,
            extra: [...this.server.players].filter(p => p.connection.state === ConnectionState.PLAY).map(p => p.username),
          });
          break;
        case "msg": {
          if (tokens.length < 2) {
            player.sendChat({
              text: "Usage: /msg <player> <message>",
            });
            break;
          }
          const [target, ...message] = tokens;
          const targetPlayer = [...this.server.players].find(p => p.username === target);
          if (targetPlayer) {
            targetPlayer.sendChat({
              text: `${player.username} whispers to you: `,
              color: "gray",
              extra: [message.join(" ")],
            });
            player.sendChat({
              text: `You whisper to ${target}: `,
              color: "gray",
              extra: [message.join(" ")],
            });
          } else {
            player.sendChat({
              text: `${target} is not online.`,
              color: "red",
            });
          }
          break;
        }
        case "me": {
          if (tokens.length < 1) {
            player.sendChat({
              text: "Usage: /me <message>",
            });
            break;
          }
          const message = tokens.join(" ");
          this.server.broadcastChat({
            text: `${player.username} ${message}`,
            italic: true,
          });
          break;
        }
        case "stop":
          // TODO: secure, etc.
          this.server.stop();
          break;
        case undefined:
          break;
        default:
          player.sendChat({ text: "Unknown command", color: "red" });
      }

      this.server.logger.info(`${player.username} issued command: ${message}`);

      return;
    }

    player.server.logger.info(`<${player.username}> ${message}`);
    this.server.broadcastChat(
      {
        text: `<${player.username}> `,
        extra: [message],
      },
      ClientChatPosition.CHAT_BOX,
      player.uuid,
      false,
    );
  }
}
