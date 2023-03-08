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

app.get('/', (req, res) => {
  res.send('<h1>Hey Socket.io</h1>');
});

gameRoom = new Map(); // tracking gameID - Players in that game

io.use(async (socket, next) => { // middleware
  const token = socket.handshake.auth.token;
  socket.userName = token.name;
  socket.roomID = token.roomID;
  next();
});

io.on('connection', (socket) => {

  socket.join(socket.userName);

  console.log(`${socket.userName} connected`);
  socket.on('disconnect', () => {
    console.log(`${socket.userName} disconnected`);
  });

  socket.on('join room', (roomID) => {
    if (gameRoom.has(roomID)){  // check if there is a room or not
      if(gameRoom.get(roomID).length < 4){ // check if the room is full or not
        socket.join(roomID);
        gameRoom.get(roomID).push(socket.userName);
        console.log(socket.userName + ' join room: ' + roomID);
      } 
      else {
        console.log(`room #${roomID} is already full...`);
      }
    }
    else {  // otherwise, create new room
      gameRoom.set(roomID, [socket.userName]);
      console.log(`room #${roomID} is created`);
      socket.join(roomID);
    }
    console.log(gameRoom);
  });

  socket.on('message', ({message, roomID}, callback) => {
    console.log('message: ' + message + ' in ' + roomID);

    // generate data to send to receivers
    const outgoingMessage = {
      name: socket.userName,
      id: "socket.user.id",
      message,
    };
    // send socket to all in room except sender
    socket.to(roomID).emit("message", outgoingMessage);
    callback({
      status: "ok"
    });
    // send to all including sender
    // io.to(roomName).emit('message', message);
  })
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});