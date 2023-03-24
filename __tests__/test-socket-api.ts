import { createServer } from 'http';
import { io } from 'socket.io-client';
import SocketServer from '../socket-server';
import { AddressInfo } from 'net';

describe('My Exploding Kitten Project', () => {
  let portAddress, ioServer;

  const testingUsers: { name: string; roomID: string }[] = [
    { name: 'testing_user1', roomID: '123' },
    { name: 'testing_user2', roomID: '123' },
    { name: 'testing_user3', roomID: '123' },
    { name: 'testing_user4', roomID: '123' },
    { name: 'testing_user5', roomID: '124' },
  ];

  beforeAll((done) => {
    const httpServer = createServer();
    httpServer.listen(() => {});
    var { port } = httpServer.address() as AddressInfo;
    portAddress = port;
    ioServer = new SocketServer();
    ioServer.io.attach(httpServer);
    done();
  });

  afterAll((done) => {
    ioServer.io?.close();
    done();
  });

  test('a user is able to login to the room', (done) => {
    var token = testingUsers[0];
    let clientSocket = io(`http://localhost:${portAddress}`, {
      auth: {
        token,
      },
    });

    clientSocket.close();

    done();
  });

  test('two users can join the same room and communicate with each other', (done) => {
    var token = testingUsers[0];

    let clientSocket1 = io(`http://localhost:${portAddress}`, {
      auth: {
        token,
      },
    });
    token = testingUsers[1];
    let clientSocket2 = io(`http://localhost:${portAddress}`, {
      auth: {
        token,
      },
    });
    clientSocket1.emit('join room', '123'); // join the specific room
    clientSocket2.emit('join room', '123'); // join the specific room

    clientSocket1.on('message', async (msg) => {
      console.log(`message in client 1: ${msg.name}`);
      expect(msg.name).toBe('testing_user1');
      expect(msg.message).toBe('testing message to the room ID 123');
    });
    clientSocket2.on('message', async (msg) => {
      console.log(`message in client 2: ${msg.name}`);
      expect(msg.name).toBe('testing_user1');
      expect(msg.message).toBe('testing message to the room ID 123');
    });

    clientSocket1.emit(
      'message',
      { message: 'testing message to the room ID 123', roomID: '123' },
      () => {},
    );

    setTimeout(() => {
      clientSocket1.close();
      clientSocket2.close();
      done();
    }, 2000);
  });

  // TODO: on doing
  test('Game Loop Test', (done) => {
    var token = testingUsers[0];

    let clientSocket1 = io(`http://localhost:${portAddress}`, {
      auth: {
        token,
      },
    });
    token = testingUsers[1];
    let clientSocket2 = io(`http://localhost:${portAddress}`, {
      auth: {
        token,
      },
    });
    token = testingUsers[2];
    let clientSocket3 = io(`http://localhost:${portAddress}`, {
      auth: {
        token,
      },
    });
    token = testingUsers[3];
    let clientSocket4 = io(`http://localhost:${portAddress}`, {
      auth: {
        token,
      },
    });

    clientSocket1.emit('join room', '123'); // join the specific room
    clientSocket2.emit('join room', '123'); // join the specific room
    clientSocket3.emit('join room', '123'); // join the specific room
    clientSocket4.emit('join room', '123'); // join the specific room

    clientSocket4.emit(
      'game start',
      '123'
    );

    setTimeout(() => {
      clientSocket1.close();
      clientSocket2.close();
      clientSocket3.close();
      clientSocket4.close();
      // done();
    }, 1000000000);
  });

});
