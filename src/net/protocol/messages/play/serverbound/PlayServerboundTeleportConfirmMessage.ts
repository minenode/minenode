import { MessageHandler } from "../../../Message";
import Server from "../../../../../server/Server";
import { ConnectionState } from "../../../../../server/Connection";
import { MineBuffer } from "../../../../../../native/index";
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

    // TODO: handle
    void teleportId, player;
  }
}
