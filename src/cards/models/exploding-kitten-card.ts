import Card from './card-base';

/**
 * Represents an Exploding Kitten card in the game.
 */
class ExplodingKittenCard extends Card {
  /**
   * Create a new ExplodingKittenCard.
   */
  constructor() {
    super('Exploding Kitten', 'Exploding');
  }
}

export default ExplodingKittenCard;
