const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
import SocketServer from './socket-server';

server.listen(process.env.PORT || 3000, () => {
  const port = server.address().port;
	console.log('Application is running at port %s', port);
});
const ioServer = new SocketServer();
ioServer.io.attach(server);
