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
import Server from "../../../../../server/Server";
import { ClientChatPosition } from "../../../../../utils/Enums";
import { filterCount, filterMap } from "../../../../../utils/SetUtils";
import { Player } from "../../../../../world/Player";
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

  public async handle(buffer: MineBuffer, player: Player): Promise<void> {
    let message = buffer.readString();

    if (message.length > 256) {
      await player.disconnect("Invalid chat message");
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
          await player.sendChat({
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
        case "list": {
          const onlineCount = filterCount(this.server.players(), p => p.connection.state === ConnectionState.PLAY);
          const onlineList = filterMap(
            this.server.players(),
            p => p.connection.state === ConnectionState.PLAY,
            p => p.username,
          );
          await player.sendChat({
            text: `Online players (${onlineCount}):`,
            extra: [...onlineList.map(username => `\n- ${username}`)],
          });
          break;
        }
        case "msg": {
          if (tokens.length < 2) {
            await player.sendChat({
              text: "Usage: /msg <player> <message>",
            });
            break;
          }
          const [target, ...message] = tokens;
          const targetPlayer = this.server.getPlayer(target);
          if (targetPlayer) {
            await targetPlayer.sendChat({
              text: `${player.username} whispers to you: `,
              color: "gray",
              extra: [message.join(" ")],
            });
            await player.sendChat({
              text: `You whisper to ${target}: `,
              color: "gray",
              extra: [message.join(" ")],
            });
          } else {
            await player.sendChat({
              text: `${target} is not online.`,
              color: "red",
            });
          }
          break;
        }
        case "me": {
          if (tokens.length < 1) {
            await player.sendChat({
              text: "Usage: /me <message>",
            });
            break;
          }
          const message = tokens.join(" ");
          await this.server.broadcastChat({
            text: `${player.username} ${message}`,
            italic: true,
          });
          break;
        }
        case "stop":
          // TODO: secure, etc.
          await this.server.stop();
          break;
        case undefined:
          break;
        default:
          await player.sendChat({ text: "Unknown command", color: "red" });
      }

      this.server.logger.info(`${player.username} issued command: ${message}`);

      return;
    }

    player.server.logger.info(`<${player.username}> ${message}`);
    await this.server.broadcastChat(
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

export const selfRegisterMessageHandler = (server: Server) => new PlayServerboundChatMessage(server);
