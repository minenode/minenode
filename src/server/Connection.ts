// Connection.ts - Provides a wrapper around an inbound TCP socket which handles message framing, etc.
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
import * as zlib from "zlib";

import { EventEmitter } from "eventemitter3";
import MineBuffer from "../utils/MineBuffer";
import { IClientboundMessage } from "../net/protocol/Message";
import EncryptionState from "./EncryptionState";
import Server from "./Server";
import { Chat } from "../utils/DataTypes";
import LoginDisconnectMessage from "../net/protocol/messages/login/clientbound/LoginDisconnectMessage";

export const MAX_PACKET_SIZE = 1024 * 1024;

export enum ConnectionState {
  HANDSHAKE = 0,
  STATUS = 1,
  LOGIN = 2,
  PLAY = 3,
}

export function getConnectionState(state: number): "HANDSHAKE" | "STATUS" | "LOGIN" | "PLAY" | null {
  if (state === ConnectionState.HANDSHAKE) return "HANDSHAKE";
  if (state === ConnectionState.STATUS) return "STATUS";
  if (state === ConnectionState.LOGIN) return "LOGIN";
  if (state === ConnectionState.PLAY) return "PLAY";
  return null;
}

/**
 * A wrapper class around an incoming TCP socket. Handles message framing, encryption, etc.
 */
export default class Connection extends EventEmitter<{
  message: [{ packetID: number; payload: MineBuffer }];
  disconnect: [];
}> {
  public socket: net.Socket;
  public remote: string;
  public buffer: MineBuffer = new MineBuffer();
  public compression = false;
  public state = ConnectionState.HANDSHAKE;
  public clientProtocol?: number;
  public encryption?: EncryptionState;
  public encryptionEnabled = false;
  public server: Server;

  public constructor(server: Server, socket: net.Socket) {
    super();

    this.server = server;
    this.socket = socket;
    this.remote = `${socket.remoteAddress}:${socket.remotePort}`;

    if (this.server.options.encryption && this.server.keypair) {
      this.encryption = new EncryptionState(this.server.keypair);
    }

    // Bind events - close, data, error
    this.socket.on("close", this._onClose.bind(this));
    this.socket.on("data", this._onData.bind(this));
    this.socket.on("error", this._onError.bind(this));
  }

  public enableEncryption(): void {
    if (!this.encryption) {
      throw new Error("Cannot enable connection encryption without encryption enabled on server");
    }
    this.encryptionEnabled = true;
  }

  public writeMessage(message: IClientboundMessage): void {
    const buffer = new MineBuffer();
    message.encode(buffer);
    this.write(message.id, buffer);
  }

  public write(packetID: number, payload: MineBuffer): void {
    let buffer = new MineBuffer();
    buffer.writeVarInt(packetID);
    buffer.writeBytes(payload.readBytes(payload.remaining));

    if (this.compression) {
      const data = new MineBuffer();
      data.writeVarInt(buffer.remaining);
      data.writeBytes(zlib.gzipSync(buffer.readBytes(buffer.remaining)));
      buffer = data;
    }

    const data = new MineBuffer();
    data.writeVarInt(buffer.remaining);
    data.writeBytes(buffer.readBytes(buffer.remaining));

    let finalBuffer = data.readBytes(data.remaining);

    if (this.encryptionEnabled && this.encryption) {
      finalBuffer = this.encryption.updateCipher(finalBuffer);
    }

    this.socket.write(finalBuffer);
  }

  public hardDisconnect(): void {
    this.socket.destroy();
  }

  public disconnect(reason: Chat): void {
    console.log(`[server/WARN] ${this.remote}: disconnect called with reason: ${reason}`);
    if (this.state === ConnectionState.HANDSHAKE || this.state === ConnectionState.STATUS) {
      this.hardDisconnect();
    } else if (this.state === ConnectionState.LOGIN) {
      const msg = new LoginDisconnectMessage(reason);
      this.writeMessage(msg);
      this.socket.end(); // async
    } else if (this.state === ConnectionState.PLAY) {
      // TODO
      this.hardDisconnect();
    }
  }

  protected _onClose(/* hadError = false */): void {
    this.emit("disconnect");
    // TODO
  }

  protected _onData(data: Buffer): void {
    if (data.length > MAX_PACKET_SIZE) {
      throw new RangeError("packet size too large");
    }

    if (this.encryptionEnabled && this.encryption) {
      data = this.encryption.updateDecipher(data);
    }

    this.buffer.writeBytes(data);

    while (this.buffer.remaining > 0) {
      const readOffset = this.buffer.readOffset;
      let payload: MineBuffer;

      try {
        const length = this.buffer.readVarInt();
        payload = new MineBuffer(this.buffer.readBytes(length));
      } catch (e) {
        if (e instanceof RangeError && e.message === "readBytes() out-of-bounds") {
          this.buffer.readOffset = readOffset;
          break;
        }
        throw e;
      }

      if (this.compression) {
        const dataLength = payload.readVarInt();
        if (dataLength !== 0) {
          payload = new MineBuffer(zlib.gunzipSync(payload.readBytes(payload.remaining)));
          if (dataLength !== payload.remaining) {
            throw new RangeError("uncompressed length does not match");
          }
        }
      }

      const packetID = payload.readVarInt();
      this.emit("message", { packetID, payload });
    }

    this.buffer = new MineBuffer(this.buffer.readBytes(this.buffer.remaining));
  }

  protected _onError(error: unknown): void {
    console.error(error);
    // TODO
  }
}
