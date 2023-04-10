import Player from '../player/player';
import Deck from '../cards/models/deck';
import card from '../cards/models/card';
import Card from '../cards/models/card-base';
import { Socket } from 'socket.io';
/**
 * Represents a game of Exploding Kittens.
 */
class Game {
  players: Player[];
  deck: Deck;
  discardPile: Card[];
  turn: number;
  numberOfPlayers: number;
  currentPlayerIndex: number;
  currentPlayer: Player;
  diedPlayer: Player[];
  attackStack: number;
  lastPlayedCard: any;
  gameLogCallback: any;
  allPlayers: Player[];

  /**
   * Create a new game with the specified players.
   * @param {string[]} playerNames - The names of the players.
   */
  constructor(playerNames: any, gameLogCallback: any) {
    this.players = playerNames.map((name: string) => new Player(name));
    this.allPlayers = this.players.slice();
    this.deck = new Deck();
    this.discardPile = [];
    this.turn = 0;
    this.numberOfPlayers = this.players.length;
    this.currentPlayerIndex = Math.floor(Math.random() * 4); // random number 0-3 at the beginning of the game
    this.currentPlayer = this.players[this.currentPlayerIndex]; // current player
    this.diedPlayer = [];
    this.attackStack = 0;
    this.lastPlayedCard = null;
    this.gameLogCallback = gameLogCallback;
  }

  // TODO: dont forget this part, currently exposing all cards
  getCurrentState() {
    return {
      players: this.players,
      deck: this.deck,
      discardPile: this.discardPile,
      turn: this.turn,
      numberOfPlayers: this.numberOfPlayers,
      currentPlayerIndex: this.currentPlayerIndex,
      currentPlayer: this.currentPlayer,
      diedPlayer: this.diedPlayer,
      attackStack: this.attackStack,
      lastPlayedCard: this.lastPlayedCard,
      allPlayers: this.allPlayers,
    };
  }

  getPlayers() {
    return this.players;
  }

  /**
   * Add to Died Player
   */
  AddDeadPlayer(player: Player) {
    this.diedPlayer.push(player);
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
   * Draw cards for the current player.
   */
  drawCards() {
    const drawCount = this.attackStack > 0 ? this.attackStack + 1 : 1;
    for (let i = 0; i < drawCount; i++) {
      const drawnCard = this.deck.draw();
      if (drawnCard instanceof card.ExplodingKittenCard) {
        this.gameLogCallback(`${this.currentPlayer.name} gets an Exploding Kitten Card`);
        console.log(`${this.currentPlayer.name} gets an Exploding Kitten Card`);
        const defuseIndex = this.currentPlayer.hasDefuseCard();
        if (defuseIndex >= 0) {
          // Use the Defuse card
          this.gameLogCallback(`${this.currentPlayer.name} has a defuse card`);
          console.log(`${this.currentPlayer.name} has a defuse card`);
          this.currentPlayer.hand.splice(defuseIndex, 1);
          this.discardPile.push(new card.DefuseCard());
          this.deck.addcards(new card.ExplodingKittenCard(), 1);
          this.deck.shuffle();
          // Notify the player to place the Exploding Kitten back into the deck
        } else {
          // The player does not have a Defuse card and is eliminated
          this.AddDeadPlayer(this.currentPlayer);
          this.gameLogCallback(`${this.currentPlayer.name} is dead`);
          console.log(`${this.currentPlayer.name} is dead`);
          this.players.splice(this.players.indexOf(this.currentPlayer), 1);
          this.numberOfPlayers--;
        }
      } else {
        this.currentPlayer.addCardToHand(drawnCard);
      }
    }
    this.attackStack = 0;
  }

  /**
   * Add exploding Kitten to the deck, then shuffle the deck.
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
  async playCard(
    player: Player,
    cardIndex: number,
    requestPlayNopeCallback: (player: Player) => Promise<boolean>,
  ) {
    if (cardIndex === -1) {
      return null;
    }
    const playcard = player.getCardbyIndex(cardIndex);
    this.gameLogCallback(`${this.currentPlayer.name} plays ${playcard.getName()}`);
    console.log(`${this.currentPlayer.name} plays ${playcard.getName()}`);
    this.lastPlayedCard = playcard;

    //If player play Number Card Nope cannot be played.
    if (playcard instanceof card.NumberCard) {
      this.useNumberCard(this.currentPlayer, this.currentPlayer.hasPair());
      return;
    }
    this.discardPile.push(playcard);
    player.removeCardByIndex(cardIndex);
    // Check if the next player wants to play a Nope card
    const nopeCardPlayed = await this.waitForNope(requestPlayNopeCallback);
    console.log(nopeCardPlayed);
    if (nopeCardPlayed) {
      return;
    }
    //Activate card effect

    //Shuffle Card effect
    if (playcard instanceof card.ShuffleCard) {
      this.useShuffle();
    }
    //See the future Card effect
    else if (playcard instanceof card.SeeTheFutureCard) {
      this.useSeeTheFutureCard();
      // console.log(this.useSeeTheFutureCard());
    }
    //Attack Card effect
    else if (playcard instanceof card.AttackCard) {
      this.useAttackCard();
      return true;
    }
    //Skip Card effect
    else if (playcard instanceof card.SkipCard) {
      this.useSkipCard();
      return true;
    }
    //Favor Card effect
    else if (playcard instanceof card.FavorCard) {
      const targetPlayer = this.choosePlayer(player);
      this.useFavorCard(targetPlayer);
    }
  }

  /**
   * Wait for a Nope card to be played, allowing players to play a Nope card in response to an action.
   * @param {number} nopeCount - The number of consecutive Nope cards played so far.
   * @returns {Promise<boolean>} A promise that resolves to true if the original action is canceled, or false if it's not.
   */
  async waitForNope(
    requestPlayNope: (player: Player) => Promise<boolean>,
    nopeCount = 0,
    lastNopePlayer: Player = this.currentPlayer,
  ): Promise<boolean> {
    let nopePlayed = false;
    const timeout = new Promise((resolve) => setTimeout(resolve, 5000));

    for (const player of this.players) {
      if (player === lastNopePlayer) {
        continue;
      }

      const nopeCardIndex = player.hasNopeCard();
      if (nopeCardIndex >= 0) {
        console.log(`${player.name} got the nope card`);
        const response = await Promise.race([requestPlayNope(player), timeout]);
        if (response) {
          console.log(`${player.name} plays nope card`);
          nopePlayed = true;
          nopeCount++;
          lastNopePlayer = player;
          this.playNopeCard(player, nopeCardIndex);
          break;
        }
      }
    }

    if (nopePlayed) {
      // Wait for another Nope card in response to the current Nope card
      const nopeCanceled = await this.waitForNope(requestPlayNope, nopeCount, lastNopePlayer);
      // If nopeCanceled is true, it means an even number of Nopes were played, so the original action is not canceled
      return nopeCanceled;
    } else {
      // If nopePlayed is false, it means there were no more Nopes played
      // If nopeCount is odd, the original action is canceled
      console.log(`no one plays nope card`);
      return nopeCount % 2 === 1;
    }
  }

  /**
   * Play a Nope card.
   */
  playNopeCard(player: Player, cardIndex: number) {
    const nopeCard = player.getCardbyIndex(cardIndex);
    console.log(`Player ${player.name} plays a Nope card`);
    this.discardPile.push(nopeCard);
    player.removeCardByIndex(cardIndex);
    this.lastPlayedCard = nopeCard;
  }

  /**
   *Random target player (as for now)
   */
  choosePlayer(player: Player) {
    let randomIndex: number;
    let randomPlayer: Player;

    do {
      randomIndex = Math.floor(Math.random() * this.players.length);
      randomPlayer = this.players[randomIndex];
    } while (randomPlayer.name === player.name);

    return randomPlayer;
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
    return this.deck.peek(3);
  }

  /**
   * Use Skip card effect.
   */
  useSkipCard() {
    if (this.attackStack == 0) {
      this.nextTurn();
    } else {
      this.attackStack--;
    }
  }

  /**
   * Use Attack card effect.
   */
  useAttackCard() {
    this.attackStack++;
    this.nextTurn();
  }

  /**
   * Use Favor card effect.
   */
  useFavorCard(targetPlayer: Player) {
    if (targetPlayer.getHandLength() == 0) {
      console.log(`${this.currentPlayer.name} steal a card from ${targetPlayer.name}`);
      console.log(`${targetPlayer.name} does not have any card`);
      return;
    }
    const chosenCard = targetPlayer.giveRandomCard();
    this.currentPlayer.addCardToHand(chosenCard);
    this.gameLogCallback(`${this.currentPlayer.name} steal a card from ${targetPlayer.name}`);
    console.log(`${this.currentPlayer.name} steal a card from ${targetPlayer.name}`);
  }

  useNumberCard(player: Player, cardIndices: number[]) {
    // Check if the player has a pair of NumberCards with the same rank
    if (cardIndices.length === 2) {
      console.log(`${player.name} got 2 cards`);
      cardIndices.sort((a, b) => a - b);
      const card1 = player.getCardbyIndex(cardIndices[0]);
      const card2 = player.getCardbyIndex(cardIndices[1]);

      if (card1 instanceof card.NumberCard && card2 instanceof card.NumberCard) {
        // Discard the pair of cards
        this.discardPile.push(card1, card2);
        player.removeCardByIndex(cardIndices[1]);
        player.removeCardByIndex(cardIndices[0]);

        // Choose a target player
        const targetPlayer = this.choosePlayer(player);

        // Use the pair effect (steal a card from the target player)
        this.gameLogCallback(`player ${player.name} use pair effect to ${targetPlayer.name}`);
        console.log(`player ${player.name} use pair effect to ${targetPlayer.name}`);
        this.useFavorCard(targetPlayer);
      }
    }
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

  nextPlayer() {
    return this.players[(this.currentPlayerIndex + 1) % this.players.length];
  }
}

export default Game;
