import Card from './card-base';

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

export default FavorCard;
