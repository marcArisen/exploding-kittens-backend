import Deck from './deck';
const Card = require('./card-base');
const Deck = require('./deck');

/**
 * Represents a "Nope" card in the Exploding Kittens game.
 */
class ShuffleCard extends Card {
  /**
   * Create a new "Nope" card.
   */
  constructor() {
    super('Shuffle', 'Action');
  }

  /**
   * Create a new "Nope" card.
   */
  ability(deck: Deck) {

  }
}

module.exports = ShuffleCard;
