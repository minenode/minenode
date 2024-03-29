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

// import * as net from "net";

// import MineBuffer from "../../src/utils/MineBuffer";
// import Connection from "../../src/server/Connection";

test("dummy", () => {
  expect(true).toBe(true);
});
// TODO: re-implement this test to accomodate new Connection class

/*
function pipe(callback: (client: Connection, server: Connection, callback: () => unknown) => unknown): void {
  const server = net
    .createServer(serverSocket => {
      server.close();
      const serverConnection = new Connection(serverSocket);
      callback(clientConnection, serverConnection, () => {
        expect(serverConnection.buffer.remaining).toBe(0);
        clientConnection.socket.end();
        serverConnection.socket.end();
      });
    })
    .listen(25565, "0.0.0.0");
  const clientSocket = net.createConnection(0, "0.0.0.0");
  const clientConnection = new Connection(clientSocket);
}

function testPacket(client: Connection, server: Connection, packetID: number, payload: MineBuffer, callback: () => unknown): void {
  const payload2 = payload.clone();
  const targetData = payload2.readRemaining().toString("hex");
  client.write(packetID, payload);
  server.once("message", result => {
    const resultData = result.payload.readRemaining().toString("hex");
    expect(result.packetID).toBe(packetID);
    expect(resultData).toBe(targetData);
    callback();
  });
}

test("send/recv packet", done => {
  const buffer = new MineBuffer();
  for (let i = 0; i < 256; i++) {
    buffer.writeVarInt(i);
  }

  pipe((client, server, callback) => {
    testPacket(client, server, 1, buffer, () => {
      callback();
      done();
    });
  });
});

test("send/recv compressed packet", done => {
  const buffer = new MineBuffer();
  for (let i = 0; i < 256; i++) {
    buffer.writeVarInt(i);
  }

  pipe((client, server, callback) => {
    client.compression.enabled = true;
    client.compression.threshold = 1;
    server.compression.enabled = true;
    server.compression.threshold = 1;

    testPacket(client, server, 1, buffer, () => {
      callback();
      done();
    });
  });
});
*/
