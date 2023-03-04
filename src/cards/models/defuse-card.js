const Card = require('./card-base');

/**
 * Represents a Defuse card in the game.
 */
class DefuseCard extends Card {
  /**
   * Create a new DefuseCard.
   */
  constructor() {
    super('Defuse', 'Defuse');
  }
}

module.exports = DefuseCard;
