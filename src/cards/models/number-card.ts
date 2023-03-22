import Card from './card-base';

/**
 * Represents a Number card in the game.
 */
class NumberCard extends Card {
  /**
   * Create a new NumberCard.
   * @param {string} rank - The rank of the card.
   */
  constructor(rank: string) {
    super(rank, 'Number');
  }
}

export default NumberCard;
