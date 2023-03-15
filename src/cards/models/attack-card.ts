import Card from './card-base';

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

export default AttackCard;
