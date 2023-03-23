import { Server } from 'socket.io';
import GameServer from './game-server';

class SocketServer {

    io: Server;
    gameRoom: Map<string, string[]>;
    gameInstances: Map<string, GameServer>;


    constructor() {
        // initialize socketio and disable cors
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
            // middleware
            const token = socket.handshake.auth.token;
            socket.userName = token.name;
            socket.roomID = token.roomID;
            next();
        });
    }

    activateEventListener() {
        this.io.on('connection', (socket: any) => {
            socket.join(socket.userName);

            console.log(`${socket.userName} connected to the server`);
            socket.on('disconnect', () => {
                var filteredPlayers: string[] = this.gameRoom
                    .get(socket.roomID)
                    ?.filter(function (value: any, index: any, arr: any) {
                        // delete user from the room
                        return value != socket.userName;
                    })!;
                //   var updatedPlayers
                this.gameRoom.set(socket.roomID, filteredPlayers);
                this.io.to(socket.roomID).emit('join room', this.gameRoom.get(socket.roomID));
                console.log(`${socket.userName} disconnected to the server`);
            });

            socket.on('join room', (roomID: string) => {


                if (this.gameRoom.has(roomID)) {

                    const currentGameRoom = this.gameRoom.get(roomID)!;
                    // check if there is a room or not
                    if (currentGameRoom.length < 4) {
                        // check if the room is full or not
                        currentGameRoom.push(socket.userName);
                        socket.join(roomID);
                        this.io.to(roomID).emit('join room', this.gameRoom.get(roomID));
                        console.log(socket.userName + ' join room: ' + roomID);
                    } else {
                        console.log(`room #${roomID} is already full...`);
                    }
                } else {
                    // otherwise, create new room
                    this.gameRoom.set(roomID, [socket.userName]);
                    socket.join(roomID);
                    this.io.to(roomID).emit('join room', this.gameRoom.get(roomID));
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
                this.io.to(roomID).emit('message', outgoingMessage);
                callback({
                    status: 'ok',
                });
            });

            /// TODO: on testing 
            socket.on('game start', (roomID: string) => {
                if (this.gameRoom.has(roomID)) {

                    const currentGameRoom = this.gameRoom.get(roomID)!;
                    // check if there is a room or not
                    if (currentGameRoom.length == 4) {
                        // check if the room is full or not
                        var listOfPlayers = this.gameRoom.get(roomID)!;
                        this.gameInstances.set(roomID, new GameServer(listOfPlayers));
                        console.log(this.gameInstances.get(roomID)?.game);

                        // TODO: emit something to notify client that game started

                        // console.log(this.gameInstances.get(roomID).game);
                        // this.gameInstances.get(roomID).game.drawCards();
                        // console.log("================================");
                        // console.log(this.gameInstances.get(roomID).game);
                    } else {
                        console.log(`room #${roomID} needs more player to join...`);
                    }
                }
            });

        });
    }
}

export default SocketServer;