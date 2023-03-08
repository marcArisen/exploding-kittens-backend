/* eslint-disable prettier/prettier */
const Deck = require('./deck');
const Player = require('./player');
/**
 * Represents a game of Exploding Kittens.
 */
class Game {
  /**
   * Create a new game with the specified players.
   * @param {string[]} playerNames - The names of the players.
   */
  constructor(playerNames) {
    this.players = playerNames.map((name) => new Player(name));
    this.deck = new Deck();
    this.discardPile = [];
    this.turn = 0;
    this.phase = ["begin", "action", "draw", "end"];
    this.numberOfPlayers = this.players.length;
    this.currentPlayerIndex = Math.floor(Math.random() * 4); // random number 0-3 at the beginning of the game
    this.currentPlayer = this.players[this.currentPlayerIndex]; // current player
    
  }

  /**
   * Deal cards to each player.
   */
  dealCards() {
    this.players.forEach((player) => {
      for (let i = 0; i < 4; i++) {
        player.addCardToHand(this.deck.draw())
      }
    });
  }
  /**
   * Add exploding Kitten.
   */
  addExplodingKittenCard() {
    this.deck.generateBombedCat();
    this.deck.shuffle();
  }
   /**
   * Add Defuse Kitten.
   */
   addDefuseCard() {
    this.players.forEach((player) => {
        player.addCardToHand(new card.DefuseCard())
    });
  }



}

module.exports = Game;
