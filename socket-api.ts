import { Server } from 'socket.io';
import Game  from './src/game/game';

// initialize socketio and disable cors
const io = new Server({
  cors: {
    origin: '*',
  },
});

interface SocketApi {
  io: any;
}

const socketApi: SocketApi = {
  io: io,
};

const gameRoom = new Map(); // tracking gameID - Players in that game
const gameInstances = new Map(); // tracking gameID - Game Instances

io.use(async (socket: any, next: Function) => {
  // middleware
  const token = socket.handshake.auth.token;
  socket.userName = token.name;
  socket.roomID = token.roomID;
  next();
});

io.on('connection', (socket: any) => {
  socket.join(socket.userName);

  console.log(`${socket.userName} connected to the server`);
  socket.on('disconnect', () => {
    var filteredPlayer: Array<string> = gameRoom
      .get(socket.roomID)
      ?.filter(function (value: any, index: any, arr: any) {
        // delete user from the room
        return value != socket.userName;
      });
    gameRoom.set(socket.roomID, filteredPlayer);
    io.to(socket.roomID).emit('join room', gameRoom.get(socket.roomID));
    console.log(`${socket.userName} disconnected to the server`);
  });

  socket.on('join room', (roomID: string) => {
    if (gameRoom.has(roomID)) {
      // check if there is a room or not
      if (gameRoom.get(roomID).length < 4) {
        // check if the room is full or not
        gameRoom.get(roomID).push(socket.userName);
        socket.join(roomID);
        io.to(roomID).emit('join room', gameRoom.get(roomID));
        console.log(socket.userName + ' join room: ' + roomID);
      } else {
        console.log(`room #${roomID} is already full...`);
      }
    } else {
      // otherwise, create new room
      gameRoom.set(roomID, [socket.userName]);
      socket.join(roomID);
      io.to(roomID).emit('join room', gameRoom.get(roomID));
      console.log(`room #${roomID} is created by ${socket.userName}`);
    }
  });

  socket.on('message', ({ message, roomID }: any, callback: Function) => {
    console.log('message: ' + message + ' in ' + roomID);

    // generate data to send to receivers
    const outgoingMessage = {
      name: socket.userName,
      message,
    };
    io.to(roomID).emit('message', outgoingMessage);
    callback({
      status: 'ok',
    });
  });

  /// TODO: on testing 
  socket.on('game start', (roomID: string) => {
    if (gameRoom.has(roomID)) {
      // check if there is a room or not
      if (gameRoom.get(roomID).length == 4) {
        // check if the room is full or not
        var listOfPlayers = gameRoom.get(roomID);
        gameInstances.set(roomID, new Game(listOfPlayers));
        gameInstances.get(roomID).dealCards();
        gameInstances.get(roomID).addExplodingKittenCard();
      } else {
        console.log(`room #${roomID} needs more player to join...`);
      }
    }
  });
  
});

export default socketApi;
