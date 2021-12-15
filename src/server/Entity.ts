import { EventEmitter, ValidEventTypes } from "eventemitter3";
import * as uuid from "uuid";

import Server from "./Server";

// eslint-disable-next-line @typescript-eslint/ban-types
export abstract class Entity<E extends ValidEventTypes = {}> extends EventEmitter<E> {
  public readonly server: Server;
  public readonly id: number;
  public readonly uuid: string;

  public constructor(server: Server) {
    super();
    this.server = server;
    this.id = server["_nextEntityId"]++;
    this.uuid = uuid.v4();
  }
}
