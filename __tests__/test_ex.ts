import { createServer } from "http";
import { io } from "socket.io-client";
import socketApi from "../socketApi";
import { AddressInfo } from "net";

describe("my awesome project", () => {
  let portAddress;

  const testingUsers: { name: string, roomID: string }[] = [
    {name: "testing_user1", roomID: "123"},
    {name: "testing_user2", roomID: "123"},
    {name: "testing_user3", roomID: "123"},
    {name: "testing_user4", roomID: "123"},
    {name: "testing_user5", roomID: "124"},
];

  beforeAll((done) => {

    const httpServer = createServer();
    httpServer.listen(() => {
      console.log(`test server starting at port ${portAddress}`);
    });
    var { port } = httpServer.address() as AddressInfo
    portAddress = port;
    socketApi.io.attach(httpServer);
    done();

  });

  afterAll(() => {
    socketApi?.io?.close();
  });

  test("a user is able to login to the room", (done) => {
    
    var token = testingUsers[0];
    let clientSocket = io(`http://localhost:${portAddress}`, {
        auth: {
          token
        },
      });
 
    clientSocket.close();

    done();

  });

  test("two users can join the same room and communicate with each other", (done) => {

    var token = testingUsers[0];

    let clientSocket1 = io(`http://localhost:${portAddress}`, {
        auth: {
          token
        },
      });
    token = testingUsers[1];
    let clientSocket2 = io(`http://localhost:${portAddress}`, {
        auth: {
          token
        },
      });
    clientSocket1.emit('join room', "123"); // join the specific room
    clientSocket2.emit('join room', "123"); // join the specific room
    
    clientSocket1.on("message", msg => {
      console.log(`message to client 1: ${msg}`);
      expect(msg.name).toBe("testing_user1");
      expect(msg.message).toBe("testing message to the room ID 123");
      done();
    });
    clientSocket2.on("message", msg => {
      console.log(`message to client 2: ${msg}`);
      expect(msg.name).toBe("testing_user1");
      expect(msg.message).toBe("testing message to the room ID 123");
      done();
  });

    clientSocket1.emit('message', { message: 'testing message to the room ID 123', roomID: "123" }, console.log);




  });

  // test("should work", (done) => {
  //   clientSocket.on("hello", (arg) => {
  //     expect(arg).toBe("world");
  //     done();
  //   });
  //   serverSocket.emit("hello", "world");
  // });

  // test("should work (with ack)", (done) => {
  //   serverSocket.on("hi", (cb) => {
  //     cb("hola");
  //   });
  //   clientSocket.emit("hi", (arg) => {
  //     expect(arg).toBe("hola");
  //     done();
  //   });
  // });
});