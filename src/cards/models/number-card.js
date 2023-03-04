const Card = require('./card-base');

/**
 * Represents a Number card in the game.
 */
class NumberCard extends Card {
  /**
   * Create a new NumberCard.
   * @param {string} rank - The rank of the card.
   */
  constructor(rank) {
    super(rank, 'Number');
  }
}

module.exports = NumberCard;
