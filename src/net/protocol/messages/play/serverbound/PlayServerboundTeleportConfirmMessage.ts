import { MineBuffer } from "../../../../../../native/index";
import { ConnectionState } from "../../../../../server/Connection";
import { Player } from "../../../../../server/Player";
import Server from "../../../../../server/Server";
import { MessageHandler } from "../../../Message";

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
    // eslint-disable-next-line no-sequences
    void teleportId, player;
  }
}
