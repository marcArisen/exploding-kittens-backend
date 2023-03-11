import { Socket } from "socket.io";

const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origins: '*',
  },
});

const jwt = require('jsonwebtoken');

// jwt secret
const JWT_SECRET = 'myRandomHash';

app.get('/', (req: any, res: any) => {
  res.send('<h1>Hey Socket.io</h1>');
});

const gameRoom = new Map(); // tracking gameID - Players in that game

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
    var filteredPlayer = gameRoom.get(socket.roomID).filter(function(value: any, index: any, arr: any){  // delete user from the room
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
      console.log(`room #${roomID} is created`);
    }
    console.log(gameRoom);
  });


  socket.on('message', ({ message, roomID }: any, callback: Function) => {
    console.log('message: ' + message + ' in ' + roomID);

    // generate data to send to receivers
    const outgoingMessage = {
      name: socket.userName,
      id: 'socket.user.id',
      message,
    };
    // send socket to all in room except sender
    socket.to(roomID).emit('message', outgoingMessage);
    callback({
      status: 'ok',
    });
    // send to all including sender
    // io.to(roomName).emit('message', message);
  });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});
