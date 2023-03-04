/**
 * Represents a card in the game.
 */
class Card {
  /**
   * Create a new Card.
   * @param {string} name - The name of the card.
   * @param {string} type - The type of the card (e.g. Action, Number).
   */
  constructor(name, type) {
    this.name = name;
    this.type = type;
  }

  /**
   * Get the name of the card.
   * @return {string} - The name of the card.
   */
  getName() {
    return this.name;
  }

  /**
   * Get the type of the card.
   * @return {string} - The type of the card.
   */
  getType() {
    return this.type;
  }
}

module.exports = Card;
