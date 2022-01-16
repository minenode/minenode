import { MineBuffer } from "../../../../../../native";
import { ConnectionState } from "../../../../../server/Connection";
import { Player } from "../../../../../server/Player";
import Server from "../../../../../server/Server";
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
    const message = buffer.readString();
    player.server.logger.info(`${player.username} said: ${message}`);
  }
}
