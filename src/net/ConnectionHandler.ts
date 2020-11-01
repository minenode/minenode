// ConnectionHandler.ts - Provides a wrapper around an inbound TCP socket which handles message framing, etc.
// Copyright (C) 2020 MineNode
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published
// by the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import * as net from "net";

import { EventEmitter } from "eventemitter3";
import MineBuffer from "../utils/minebuffer";

export const MAX_PACKET_SIZE = 1024 * 1024;
export const MAX_MESSAGE_SIZE = 1024 * 1024 * 4;

/**
 * A wrapper class around an incoming TCP socket. Handles message framing, encryption, etc.
 */
export default class ConnectionHandler extends EventEmitter<{
  message: [{ packetID: number; payload: MineBuffer }];
  disconnect: [];
}> {
  public socket: net.Socket;
  public buffer: MineBuffer = new MineBuffer();

  public constructor(socket: net.Socket) {
    super();
    this.socket = socket;

    // Bind events - close, data, error
    this.socket.on("close", this._onClose.bind(this));
    this.socket.on("data", this._onData.bind(this));
    this.socket.on("error", this._onError.bind(this));
  }

  protected _onClose(/* hadError = false */): void {
    this.emit("disconnect");
    // TODO
  }

  protected _onData(data: Buffer): void {
    if (data.length > MAX_PACKET_SIZE) {
      throw new RangeError("packet size too large");
    }

    this.buffer.writeBytes(data);

    // TODO: Compression

    do {
      let data, length;
      try {
        length = this.buffer.readVarInt();
        data = new MineBuffer(this.buffer.readBytes(length));
      } catch {
        this.buffer.readOffset -= this.buffer.lastReadVarIntLength;
        break;
      }
      if (length > MAX_MESSAGE_SIZE) {
        throw new RangeError("message payload length too large");
      }
      const packetID = data.readVarInt();
      const payload = new MineBuffer(data.readBytes(length - data.lastReadVarIntLength));
      this.emit("message", { packetID, payload });
    } while (this.buffer.remaining > 0);
  }

  protected _onError(error: unknown): void {
    console.error(error);
    // TODO
  }
}
