import Server from "../../../server/Server";
import { MessageHandler } from "../Message";
import { ConnectionState } from "../../../server/Connection";

import { HandshakeMessageHandler } from "./handshake/serverbound/HandshakeMessage";
import { StatusPingMessageHandler } from "./status/serverbound/StatusPingMessage";
import { StatusRequestMessageHandler } from "./status/serverbound/StatusRequestMessage";

export default class MessageHandlerFactory {
  public readonly registered: Set<MessageHandler> = new Set();

  public constructor(public readonly server: Server) {
    this.registered
      .add(new HandshakeMessageHandler(this.server))
      .add(new StatusPingMessageHandler(this.server))
      .add(new StatusRequestMessageHandler(this.server));
  }

  public getHandler(id: number, state: ConnectionState): MessageHandler | null {
    for (const handler of this.registered) {
      if (handler.state === state && handler.id === id) return handler;
    }
    return null;
  }
}
