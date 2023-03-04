const Card = require('./card-base');

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
}

module.exports = ShuffleCard;
