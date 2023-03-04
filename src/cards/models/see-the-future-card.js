const Card = require('./card-base');
/**
 * Represents a "See the Future" card in the game.
 */
class SeeTheFutureCard extends Card {
  /**
   * Create a new SeeTheFutureCard.
   */
  constructor() {
    super('See the Future', 'Action');
  }
}

module.exports = SeeTheFutureCard;
