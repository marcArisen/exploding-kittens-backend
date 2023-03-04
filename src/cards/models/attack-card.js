const Card = require('./card-base');

/**
 * Represents an Attack card in the game.
 */
class AttackCard extends Card {
  /**
   * Create a new AttackCard.
   */
  constructor() {
    super('Attack', 'Action');
  }
}

module.exports = AttackCard;
