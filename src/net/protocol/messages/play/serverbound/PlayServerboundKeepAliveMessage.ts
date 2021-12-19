import { ConnectionState } from "../../../../../server/Connection";
import { Player } from "../../../../../server/Player";
import Server from "../../../../../server/Server";
import { MineBuffer } from "../../../../../../native/index";
import { MessageHandler } from "../../../Message";

export class PlayServerboundKeepAliveMessage extends MessageHandler {
  public constructor(server: Server) {
    super({
      state: ConnectionState.PLAY,
      id: 0x0f,
      label: "keep alive",
      server,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public handle(buffer: MineBuffer, player: Player): void {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const keepAliveId = buffer.readLong();
    // TODO: time-out detection
  }
}
