import Player from '../player/player';
import Deck from '../cards/models/deck';
import card from '../cards/models/card';
/**
 * Represents a game of Exploding Kittens.
 */
class Game {
  players: Player[];
  deck: Deck;
  discardPile;
  turn: number;
  phase: Array<string>;
  currentPhase: string;
  numberOfPlayers: number;
  currentPlayerIndex: number;
  currentPlayer: Player;
  diedPlayer: Player[];
  attackStack: number;
  nopeChain: boolean;

  /**
   * Create a new game with the specified players.
   * @param {string[]} playerNames - The names of the players.
   */
  constructor(playerNames) {
    this.players = playerNames.map((name) => new Player(name));
    this.deck = new Deck();
    this.discardPile = [];
    this.turn = 0;
    this.phase = ['begin', 'action', 'draw', 'end']; //must repair after socket.io
    this.currentPhase = this.phase[0]; // Begin phase for the beginning
    this.numberOfPlayers = this.players.length;
    this.currentPlayerIndex = Math.floor(Math.random() * 4); // random number 0-3 at the beginning of the game
    this.currentPlayer = this.players[this.currentPlayerIndex]; // current player
    this.diedPlayer = [];
    this.attackStack = 0;
    this.nopeChain = false;
  }

  /**
   * Deal cards to each player.
   */
  dealCards() {
    this.players.forEach((player) => {
      for (let i = 0; i < 4; i++) {
        player.addCardToHand(this.deck.draw());
      }
    });
  }
  /**
   * Add exploding Kitten to the deck.
   */
  addExplodingKittenCard() {
    this.deck.generateBombedCat();
    this.deck.shuffle();
  }
  /**
   * Give each player 1 Defuse Card.
   */
  givePlayerDefuseCard() {
    this.players.forEach((player) => {
      player.addCardToHand(new card.DefuseCard());
    });
  }

  /**
   * Play cards
   */
  playCard(player: Player, cardIndex: number) {
    const playcard = player.getCardbyIndex(cardIndex);
    this.discardPile.push(playcard);
    player.hand.splice(cardIndex, 1);
    //Activate card effect
    //Shuffle card effect
    if (playcard instanceof card.ShuffleCard) {
      this.useShuffle();
    }
    //See the future card effect
    else if (playcard instanceof card.SeeTheFutureCard) {
      this.useSeeTheFutureCard();
    } else if (playcard instanceof card.AttackCard) {
      this.useAttackCard();
    } else if (playcard instanceof card.SkipCard) {
      this.useSkipCard();
    }
  }

  /**
   * Use Shuffle card effect.
   */
  useShuffle() {
    this.deck.shuffle();
  }

  /**
   * Use See the future card effect.
   */
  useSeeTheFutureCard() {
    this.deck.peek(3);
    //A way to make player visionable to the top three cards
  }

  /**
   * Use Skip card effect.
   */
  useSkipCard() {
    this.turn++;
  }

  /**
   * Use Attack card effect.
   */
  useAttackCard() {
    this.attackStack++;
  }

  /**
   * Move on to the next turn.
   */
  nextTurn() {
    const currentIndex = this.players.indexOf(this.currentPlayer);
    const nextPlayerIndex = (currentIndex + 1) % this.players.length;
    this.currentPlayer = this.players[nextPlayerIndex];
    this.turn++;
  }

  /**
   * Check nope chain
   */
  checkNopeChain() {
    const lastestUsedCard = this.discardPile.slice(-1).pop();
    if (lastestUsedCard instanceof card.NopeCard) {
      this.nopeChain = true;
    } else {
      this.nopeChain = false;
    }
  }

  /**
   * Check if the game is over.
   */
  gameLoop() {
    while (this.diedPlayer.length < 3) {}
  }
}
export default Game;
