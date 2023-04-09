import Card from './card-base';

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

export default NopeCard;
