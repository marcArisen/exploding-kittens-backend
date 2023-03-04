const Card = require('./card-base');

/**
 * Represents a "Nope" card in the Exploding Kittens game.
 */
class NopeCard extends Card {
  /**
   * Create a new "Nope" card.
   */
  constructor() {
    super('Nope', 'Action');
  }
}

module.exports = NopeCard;
