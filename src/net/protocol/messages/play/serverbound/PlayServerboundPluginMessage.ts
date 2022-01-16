import { MineBuffer } from "../../../../../../native/index";
import { ConnectionState } from "../../../../../server/Connection";
import { Player } from "../../../../../server/Player";
import Server from "../../../../../server/Server";
import { PluginChannel } from "../../../../../utils/Enums";
import { MessageHandler } from "../../../Message";

export class PlayServerboundPluginMessage extends MessageHandler {
  public constructor(server: Server) {
    super({
      state: ConnectionState.PLAY,
      id: 0x0a,
      label: "plugin message",
      server,
    });
  }

  public handle(buffer: MineBuffer, player: Player): void {
    const channel = buffer.readString();
    // const data = buffer.readRemaining();

    switch (channel) {
      case PluginChannel.MINECRAFT_BRAND: {
        const brand = buffer.readString();
        void brand; // Unneeded
        break;
      }
      default:
        this.server.logger.warn(`${player.connection.remote}: unknown plugin channel ${channel}`);
        break;
    }
  }
}
