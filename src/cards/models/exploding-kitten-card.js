const Card = require('./card-base');

/**
 * Represents an Exploding Kitten card in the game.
 */
class ExplodingKittenCard extends Card {
  /**
   * Create a new ExplodingKittenCard.
   * @param {boolean} exploding - Whether the card is an exploding kitten.
   */
  constructor(exploding = false) {
    super('Exploding Kitten', 'Exploding');
    this.exploding = exploding;
  }

  /**
   * Check if the card is an exploding kitten.
   * @return {boolean} - Whether the card is an exploding kitten.
   */
  isExploding() {
    return this.exploding;
  }
}

module.exports = ExplodingKittenCard;
