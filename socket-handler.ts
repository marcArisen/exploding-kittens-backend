import { Server, Socket } from 'socket.io';

class SocketHandler {
  private socket: any;
  private io: Server;

  constructor(socket: any, io: Server) {
    this.socket = socket;
    this.io = io;
  }

  waitForClientAction(
    roomID: string,
    name: string,
    eventName: string,
    timeout: number,
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      let timeoutId: NodeJS.Timeout;

      const onEvent = (data: any) => {
        console.log(`${this.socket.userName} select card index ${data}`);
        var room = this.socket.roomID;
        var userName = this.socket.userName;
        if (room === roomID && userName === name) {
          clearTimeout(timeoutId);
          this.socket.removeListener(eventName, onEvent);
          resolve(data);
        }
      };

      timeoutId = setTimeout(() => {
        this.socket.removeListener(eventName, onEvent);
        resolve(null);
      }, timeout || 5000); // Set the default timeout to 5000ms (5 seconds)

      this.socket.on(eventName, onEvent);
    });
  }

  playNopeCallBack(roomID: string, name: string, eventName: string, timeout: number): Promise<any> {
    return new Promise((resolve, reject) => {
      let timeoutId: NodeJS.Timeout;

      const onEvent = () => {
        var room = this.socket.roomID;
        var userName = this.socket.userName;
        console.log(`${this.socket.userName} play nope card!`);
        if (room === roomID && userName === name) {
          clearTimeout(timeoutId);
          this.socket.removeListener(eventName, onEvent);
          resolve(true);
        }
      };

      timeoutId = setTimeout(() => {
        this.socket.removeListener(eventName, onEvent);
        resolve(false);
      }, timeout || 5000); // Set the default timeout to 5000ms (5 seconds)

      this.socket.on(eventName, onEvent);
    });
  }

  requestCardCallBack(
    roomID: string,
    name: string,
    eventName: string,
    timeout: number,
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      let timeoutId: NodeJS.Timeout;

      const onEvent = (data: any) => {
        console.log(`${this.socket.userName} select to steal index ${data}`);
        var room = this.socket.roomID;
        var userName = this.socket.userName;
        if (room === roomID && userName === name) {
          clearTimeout(timeoutId);
          this.socket.removeListener(eventName, onEvent);
          resolve(data);
        }
      };

      timeoutId = setTimeout(() => {
        this.socket.removeListener(eventName, onEvent);
        resolve(null);
      }, timeout || 5000); // Set the default timeout to 5000ms (5 seconds)

      this.socket.on(eventName, onEvent);
    });
  }
}

export default SocketHandler;
