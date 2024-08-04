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

import { MineBuffer } from "../../../../../../native/index";
import { ConnectionState } from "../../../../../server/Connection";
import Server from "../../../../../server/Server";
import { Player } from "../../../../../world/Player";
import { MessageHandler } from "../../../Message";

export class PlayServerboundClientSettingsMessage extends MessageHandler {
  public constructor(server: Server) {
    super({
      state: ConnectionState.PLAY,
      id: 0x05,
      label: "client settings",
      server,
    });
  }

  public handle(buffer: MineBuffer, player: Player): void {
    const locale = buffer.readString();
    const viewDistance = buffer.readByte();
    const chatMode = buffer.readVarInt(); // 0 = enabled, 1 = commands only, 2 = hidden
    const chatColors = buffer.readBoolean();
    const displayedSkinParts = buffer.readUByte();
    const mainHand = buffer.readVarInt(); // 0 = left, 1 = right
    const enableTextFiltering = buffer.readBoolean(); // always false
    const allowServerListings = buffer.readBoolean();

    // TODO: handle
    // eslint-disable-next-line no-sequences
    void locale, viewDistance, chatMode, chatColors, displayedSkinParts, mainHand, enableTextFiltering, allowServerListings;
    void player;
  }
}

export const selfRegisterMessageHandler = (server: Server) => new PlayServerboundClientSettingsMessage(server);