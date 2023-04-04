import { Server, Socket } from 'socket.io';
import GameServer from './game-server';
import SocketHandler from './socket-handler';

class SocketServer {
  io: Server;
  gameRoom: Map<string, string[]>;
  socketList: Map<string, SocketHandler>;
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
    this.socketList = new Map();
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
    const socketHandler = new SocketHandler(socket, this.io);
    this.socketList.set(socket.userName, socketHandler);
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
        this.gameInstances.set(
          socket.roomID,
          new GameServer(listOfPlayers, this.io, socket.roomID, this.actionCallBack.bind(this), this.playNopeCallBack.bind(this), this.requestCardCallBack.bind(this)),
        );
        console.log(this.gameInstances.get(socket.roomID)?.game);
        this.gameInstances.get(socket.roomID)?.startGameLoop();
        this.io.to(socket.roomID).emit('game', 'ok');
      } else {
        console.log(`room #${socket.roomID} needs more player to join...`);
      }
    }
  }

  waitForClientAction(roomID: string, name: string, eventName: string, timeout: number): Promise<any> {
  return new Promise((resolve, reject) => {
    let timeoutId: NodeJS.Timeout;

    const onEvent = (data: any) => {
      var room = data.roomID;
      var userName = data.userName;
      if (room === roomID && userName == name) {
        clearTimeout(timeoutId);
        this.io.removeListener(eventName, onEvent);
        resolve(data);
      }
    };

    timeoutId = setTimeout(() => {
      this.io.removeListener(eventName, onEvent);
      resolve(null);
    }, 4000);

    this.io.on(eventName, onEvent);
  });
  
}

  actionCallBack(roomID: string, player: string) {
    return this.socketList.get(player)!.waitForClientAction(roomID, player, "action", 4900)
  }

  playNopeCallBack(roomID: string, player: string) {
    return this.socketList.get(player)!.playNopeCallBack(roomID, player, "action", 4900)
  }

  requestCardCallBack(roomID: string, player: string) {
    console.log(`${player} picking the card`);
    return this.socketList.get(player)!.requestCardCallBack(roomID, player, "request", 4900)
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
