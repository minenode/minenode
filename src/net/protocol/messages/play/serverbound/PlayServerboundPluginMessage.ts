import { MessageHandler } from "../../../Message";
import Server from "../../../../../server/Server";
import { ConnectionState } from "../../../../../server/Connection";
import MineBuffer from "../../../../../utils/MineBuffer";
import { PluginChannel } from "../../../../../utils/Enums";
import { Player } from "../../../../../server/Player";

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
        this.server.logger.info(`${player.connection.remote}: brand = ${brand}`);
        break;
      }
      default:
        this.server.logger.warn(`${player.connection.remote}: unknown plugin channel ${channel}`);
        break;
    }
  }
}