import { Socket } from 'socket.io';
import Game from './src/game/game';
import Player from './src/player/player';
class GameServer {
  game: Game;
  actionCallBack: () => Promise<any>;
  playNopeCallBack: () => Promise<any>;
  requestCardCallBack: () => Promise<any>;
  io: any;
  roomNumber: number;

  constructor(playerNames: string[], io: any, room: number) {
    this.game = new Game(playerNames);
    this.actionCallBack = this.testFunc;
    this.playNopeCallBack = this.testFunc;
    this.requestCardCallBack = this.testFunc;
    this.io = io;
    this.roomNumber = room;
    this.initialize();
  }

  // Function for Testing (need to remove after production)
  async testFunc() {
    return new Promise((resolve) => setTimeout(resolve, 6000));
  }

  initialize() {
    this.game.dealCards();
    this.game.addExplodingKittenCard();
    this.game.givePlayerDefuseCard();
  }

  // TODO: haven't done -/-'
  updateState(){
    // const outgoingMessage = {
    //   name: "game",
    //   message: JSON.stringify(this.game.getCurrentState()),
    // };
    // this.io.to(this.roomNumber).emit('message', outgoingMessage)

    this.io.to(this.roomNumber).emit('game state', this.game.getCurrentState());
  }
  // notifyCurrentPlayerTurn(){
  //   // this function is to notfiy the current player to take the action

  // }

  /**
   * Starts the game loop and manages the game state.
   */
  async startGameLoop() {
    while (this.game.diedPlayer.length < 3) {
      const currentPlayer = this.game.currentPlayer;
      this.updateState(); // update the state through SocketIO
      console.log(`It's ${currentPlayer.name}'s turn.`);

      // Give player 5 seconds to play an action card
      const cardIndex = await this.waitForPlayerAction(currentPlayer.name);

      if (cardIndex !== null) {
        await this.game.playCard(
          currentPlayer,
          cardIndex,
          this.requestPlayNope,
          this.requestCardCallBack,
        );
      } else {
        this.game.drawCards();
        this.game.nextTurn();
      }
    }

    // Announce the winner
    console.log(`The game is over. ${this.game.currentPlayer.name} wins!`);
  }

  async waitForPlayerAction(player: String): Promise<number | null> {
    // Implement logic to wait for a player to play an action card within a given time
    // If the player plays a card within the time limit, return the card index
    // If not, return null

    // this.io.to(this.roomNumber).emit('game state', this.game.getCurrentState());

    const timeout = new Promise((resolve) => setTimeout(resolve, 5000));

    const response: number | null | undefined = await Promise.race([
      this.actionCallBack(),
      timeout,
    ]);
    if (response) {
      return response;
    }
    return null;
  }

  async requestPlayNope(player: Player): Promise<boolean> {
    // Implement logic to request a player to play a Nope card
    // Return true if the player chooses to play a Nope card, false otherwise

    const timeout = new Promise((resolve) => setTimeout(resolve, 5000));

    const response: boolean | null | undefined = await Promise.race([
      this.playNopeCallBack(),
      timeout,
    ]);
    if (response) {
      return response;
    }
    return false;
  }

  async requestFromNumberCard(player: Player): Promise<number | null> {
    // Implement logic to request a player to request a card
    // Return index of the card player chosen from target player if available

    const timeout = new Promise((resolve) => setTimeout(resolve, 5000));

    const response: number | null | undefined = await Promise.race([
      this.requestCardCallBack(),
      timeout,
    ]);
    if (response) {
      return response;
    }
    return null;
  }
}

export default GameServer;
