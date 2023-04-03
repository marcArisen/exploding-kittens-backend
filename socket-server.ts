import { Server } from 'socket.io';
import GameServer from './game-server';

class SocketServer {
  io: Server;
  gameRoom: Map<string, string[]>;
  gameInstances: Map<string, GameServer>;

  constructor() {
    this.io = new Server({
      cors: {
        origin: '*',
      },
    });
    this.gameRoom = new Map();
    this.gameInstances = new Map();
    this.activateMiddleware();
    this.activateEventListener();
  }

  activateMiddleware() {
    this.io.use(async (socket: any, next: Function) => {
      const token = socket.handshake.auth.token;
      socket.userName = token.name;
      socket.roomID = token.roomID;
      next();
    });
  }

  handleConnection(socket: any) {
    socket.join(socket.userName);
    console.log(`${socket.userName} connected to the server`);
  }

  handleDisconnect(socket: any) {
    const filteredPlayers: string[] = this.gameRoom
      .get(socket.roomID)
      ?.filter((value: any) => value !== socket.userName)!;
    this.gameRoom.set(socket.roomID, filteredPlayers);
    this.io.to(socket.roomID).emit('join room', this.gameRoom.get(socket.roomID));
    console.log(`${socket.userName} disconnected to the server`);
  }

  handleJoinRoom(socket: any, roomID: string) {
    if (this.gameRoom.has(roomID)) {
      const currentGameRoom = this.gameRoom.get(roomID)!;
      if (currentGameRoom.length < 4) {
        currentGameRoom.push(socket.userName);
        socket.join(roomID);
        this.io.to(roomID).emit('join room', this.gameRoom.get(roomID));
        console.log(socket.userName + ' join room: ' + roomID);
      } else {
        console.log(`room #${roomID} is already full...`);
      }
    } else {
      this.gameRoom.set(roomID, [socket.userName]);
      socket.join(roomID);
      this.io.to(roomID).emit('join room', this.gameRoom.get(roomID));
      console.log(`room #${roomID} is created by ${socket.userName}`);
    }
  }

  handleMessage(socket: any, { message, roomID }: any, callback: Function) {
    console.log('message: ' + message + ' in ' + roomID);
    const outgoingMessage = {
      name: socket.userName,
      message,
    };
    this.io.to(roomID).emit('message', outgoingMessage);
    callback({ status: 'ok' });
  }

  handleGameLoop(socket: any) {
    if (this.gameRoom.has(socket.roomID)) {
      const currentGameRoom = this.gameRoom.get(socket.roomID)!;
      if (currentGameRoom.length === 4) {
        const listOfPlayers = this.gameRoom.get(socket.roomID)!;
        this.gameInstances.set(socket.roomID, new GameServer(listOfPlayers, this.io, socket.roomID));
        console.log(this.gameInstances.get(socket.roomID)?.game);
        this.gameInstances.get(socket.roomID)?.startGameLoop();
        this.io.to(socket.roomID).emit('game', "ok");
      } else {
        console.log(`room #${socket.roomID} needs more player to join...`);
      }
    }
  }

  async actionCallBack() {
    // Simulating a user action that can take up to 3 seconds
    const randomDelay = Math.floor(Math.random() * 3000);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`User action completed after ${randomDelay}ms`);
      }, randomDelay);
    });
  }

  activateEventListener() {
    this.io.on('connection', (socket: any) => {
      this.handleConnection(socket);

      socket.on('disconnect', () => {
        this.handleDisconnect(socket);
      });

      socket.on('join room', (roomID: string) => {
        this.handleJoinRoom(socket, roomID);
      });

      socket.on('message', (payload: any, callback: Function) => {
        this.handleMessage(socket, payload, callback);
      });

      socket.on('game loop', () => {
        this.handleGameLoop(socket);
      });
    });
  }
}

export default SocketServer;

