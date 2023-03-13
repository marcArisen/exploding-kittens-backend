const Card = require('./card-base');

/**
 * Represents a "Shuffle" card in the Exploding Kittens game.
 */
class ShuffleCard extends Card {
  /**
   * Create a new "Shuffle" card.
   */
  constructor() {
    super('Shuffle', 'Action');
  }

  /**
   * Shuffle card
   * @param {Game} game - Game's object
   */
  ability(game) {
    game.deck.shuffle();
  }
}

module.exports = ShuffleCard;
