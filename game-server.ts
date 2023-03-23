import Game  from './src/game/game';
class GameServer {

    game: Game;

    constructor(players: string[]) {
        this.game = new Game(players);
        this.initialize();
    }

    initialize(){
        this.game.dealCards();
        this.game.addExplodingKittenCard();
        this.game.givePlayerDefuseCard();
    }

    gameLoop() {

        // while (this.game.diedPlayer.length < 3) {

        // }
    }




}

export default GameServer;