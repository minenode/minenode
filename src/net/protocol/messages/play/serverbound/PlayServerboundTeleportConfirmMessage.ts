import { MessageHandler } from "../../../Message";
import Server from "../../../../../server/Server";
import { ConnectionState } from "../../../../../server/Connection";
import MineBuffer from "../../../../../utils/MineBuffer";
import { Player } from "../../../../../server/Player";

export class PlayServerboundTeleportConfirmMessage extends MessageHandler {
  public constructor(server: Server) {
    super({
      state: ConnectionState.PLAY,
      id: 0x00,
      label: "teleport confirm",
      server,
    });
  }

  public handle(buffer: MineBuffer, player: Player): void {
    const teleportId = buffer.readVarInt();

    this.server.logger.debug(`${player.connection.remote}: teleport confirm (teleportId = ${teleportId})`);
  }
}
