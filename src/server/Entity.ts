import * as uuid from "uuid";

import Server from "./Server";
import { Base } from "../core/Base";

// eslint-disable-next-line @typescript-eslint/ban-types
export abstract class Entity<T> extends Base<T> {
  public readonly id: number;
  public readonly uuid: string;

  public constructor(server: Server) {
    super(server);
    this.id = server._nextEntityId++;
    this.uuid = uuid.v4();
  }
}
