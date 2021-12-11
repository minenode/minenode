import MineBuffer from "../../src/utils/MineBuffer";
import Connection from "../../src/server/Connection";
import * as net from "net";

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
  const clientSocket = net.createConnection(25565, "0.0.0.0");
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
