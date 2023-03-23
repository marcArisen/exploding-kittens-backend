const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
import SocketServer from './socket-server';

server.listen(3000, () => {
  console.log('listening on *:3000');
});
const ioServer = new SocketServer()
ioServer.io.attach(server);
