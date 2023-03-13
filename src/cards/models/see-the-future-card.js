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

  /**
   * Peek the first three card on the top of the deck
   * @param {Game} game - Game's object
   */
  ability(game) {
    game.deck.peek(3);
  }
}

module.exports = SeeTheFutureCard;
