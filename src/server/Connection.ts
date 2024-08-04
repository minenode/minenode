/*
 * Copyright (C) 2022 MineNode
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import * as net from "net";
import util, { inspect } from "util";

import { EventEmitter } from "eventemitter3";
import CompressionState from "./CompressionState";
import EncryptionState from "./EncryptionState";
import Server from "./Server";
import { MineBuffer } from "../../native/index";
import { IClientboundMessage } from "../net/protocol/Message";
import LoginDisconnectMessage from "../net/protocol/messages/login/clientbound/LoginDisconnectMessage";
import { PlayClientboundDisconnectMessage } from "../net/protocol/messages/play/clientbound/PlayClientboundDisconnectMessage";
import { Chat, consoleFormatChat } from "../utils/Chat";

export const MAX_PACKET_SIZE = 1024 * 1024;

export enum ConnectionState {
  HANDSHAKE = 0,
  STATUS = 1,
  LOGIN = 2,
  PLAY = 3,
}

/**
 * A wrapper class around an incoming TCP socket. Handles message framing, encryption, etc.
 */
export default class Connection extends EventEmitter<{
  message: [{ packetID: number; payload: MineBuffer }];
  disconnect: [];
  stateChange: [ConnectionState];
}> {
  #state: ConnectionState = ConnectionState.HANDSHAKE;

  public get state(): ConnectionState {
    return this.#state;
  }

  public set state(state: ConnectionState) {
    this.#state = state;
  }

  public readonly server: Server;

  public socket: net.Socket;
  public remote: string;
  public buffer: MineBuffer = new MineBuffer();
  public clientProtocol?: number;
  public encryption: EncryptionState;
  public compression: CompressionState;
  public username?: string;

  protected timeout: NodeJS.Timeout | null = null;

  public constructor(server: Server, socket: net.Socket) {
    super();
    this.server = server;
    this.socket = socket;
    this.remote = `${socket.remoteAddress!}:${socket.remotePort!}`;

    this.encryption = new EncryptionState();
    this.compression = new CompressionState();

    // Bind events - close, data, error
    this.socket.on("close", this._onClose.bind(this));
    this.socket.on("data", this._wrapped_onData.bind(this));
    this.socket.on("error", this._onError.bind(this));

    this.resetTimeout();
  }

  public destroy() {
    this.socket.destroy();
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  }

  protected resetTimeout(): void {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    this.timeout = setTimeout(() => void this.disconnect("Timed out"), 30 * 1000); // TODO: config
  }

  public async writeMessage(message: IClientboundMessage): Promise<void> {
    const buffer = new MineBuffer();
    message.encode(buffer);
    this.server.logger.debug(`${this.remote}: sending message 0x${message.id.toString(16)} (len = ${buffer.remaining()})`);
    await this.write(message.id, buffer);
  }

  public write(packetID: number, payload: MineBuffer): Promise<void> {
    let buffer = new MineBuffer();
    buffer.writeVarInt(packetID);
    buffer.writeBytes(payload.readRemaining());

    if (this.compression.enabled && this.compression.threshold > 0) {
      const data = new MineBuffer();
      if (buffer.remaining() >= this.compression.threshold) {
        data.writeVarInt(buffer.remaining());
        data.writeBytes(this.compression.decompress(buffer.readRemaining()));
      } else {
        data.writeVarInt(0);
        data.writeBytes(buffer.readRemaining());
      }
      buffer = data;
    }

    const data = new MineBuffer();
    data.writeVarInt(buffer.remaining());
    data.writeBytes(buffer.readRemaining());

    let finalBuffer = data.readRemaining();

    if (this.encryption.enabled) {
      finalBuffer = this.encryption.updateCipher(finalBuffer);
    }

    return new Promise((resolve, reject) => {
      try {
        this.socket.write(finalBuffer, err => (err ? reject(err) : resolve()));
      } catch (error) {
        this.server.logger.error(`${this.remote}: ${inspect(error)}`);
      }
    });
  }

  public hardDisconnect(): void {
    this.socket.destroy();
  }

  public async disconnect(reason: Chat): Promise<void> {
    this.server.logger.warn(`${this.remote}: disconnect called with reason: ${consoleFormatChat(reason)}`);
    if (this.socket.destroyed) {
      return;
    }

    if (this.state === ConnectionState.HANDSHAKE || this.state === ConnectionState.STATUS) {
      this.hardDisconnect();
    } else if (this.state === ConnectionState.LOGIN) {
      const msg = new LoginDisconnectMessage(reason);
      await this.writeMessage(msg);
      await new Promise<void>(r => this.socket.end(() => r()));
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    } else if (this.state === ConnectionState.PLAY) {
      const msg = new PlayClientboundDisconnectMessage({ reason });
      await this.writeMessage(msg);
      await new Promise<void>(r => this.socket.end(() => r()));
    } else {
      this.hardDisconnect();
    }
  }

  protected _onClose(/* hadError = false */): void {
    this.emit("disconnect");
    // TODO
  }

  protected _wrapped_onData(data: Buffer): void {
    this.resetTimeout();
    try {
      this._onData(data);
    } catch (error) {
      this.server.logger.error(`${this.remote}: ${inspect(error)}`);
      void this.disconnect((error as Error).message);
    }
  }

  protected _onData(data: Buffer): void {
    if (data.length > MAX_PACKET_SIZE) {
      throw new RangeError("packet size too large");
    }

    if (this.encryption.enabled) {
      data = this.encryption.updateDecipher(data);
    }

    this.buffer.writeBytes(data);

    do {
      const readOffset = this.buffer.readOffset;
      let payload: MineBuffer;

      try {
        const length = this.buffer.readVarInt();
        payload = new MineBuffer(this.buffer.readBytes(length));
      } catch (e) {
        if (e instanceof RangeError && e.message === "readBytes() out-of-bounds") {
          // TODO: better error handling
          this.buffer.readOffset = readOffset;
          break;
        }
        throw e;
      }

      if (this.compression.enabled && this.compression.threshold > 0) {
        const dataLength = payload.readVarInt();
        if (dataLength !== 0) {
          payload = new MineBuffer(this.compression.compress(payload.readRemaining()));
          if (dataLength !== payload.remaining()) {
            throw new RangeError("uncompressed length does not match");
          }
        }
      }

      const packetID = payload.readVarInt();
      this.emit("message", { packetID, payload });
    } while (this.buffer.remaining() > 0);

    this.buffer = new MineBuffer();
  }

  protected _onError(error: unknown): void {
    this.server.logger.error(util.inspect(error));
    // TODO
  }
}
