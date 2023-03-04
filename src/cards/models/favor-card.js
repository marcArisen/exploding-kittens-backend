const Card = require('./card-base');

/**
 * Represents a Favor card in the game.
 */
class FavorCard extends Card {
  /**
   * Create a new FavorCard.
   */
  constructor() {
    super('Favor', 'Action');
  }
}

module.exports = FavorCard;
