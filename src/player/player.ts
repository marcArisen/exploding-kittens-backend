import Card from '../cards/models/card-base';
import card from '../cards/models/card';
/**
 * Represents a player in the game.
 */
class Player {
  name: String;
  hand: Array<Card>;
  /**
   * Create a new player.
   * @param {string} name - The name of the player.
   */
  constructor(name: string) {
    this.name = name;
    this.hand = [];
  }

  /**
   * Get the Name of the player.
   * @return {string} - The Name of the player.
   */
  getName() {
    return this.name;
  }

  /**
   * Get the player's hand.
   * @return {Array<Card>} - An array of Card objects representing the player's hand.
   */
  getHand() {
    return this.hand;
  }

  getCardbyIndex(index: number) {
    return this.hand[index];
  }

  /**
   * Get the player's hand length.
   * @return {Number} - An number of Card in the player's hand.
   */
  getHandLength() {
    return this.hand.length;
  }

  /**
   * Add a card to the player's hand.
   * @param {Card} card - The card to add to the player's hand.
   */
  addCardToHand(card: any) {
    this.hand.push(card);
  }

  /**
   * Remove a card from the player's hand.
   * @param {Card} card - The card to remove from the player's hand.
   */
  removeCardFromHand(card: any) {
    const index = this.hand.indexOf(card);
    if (index > -1) {
      this.hand.splice(index, 1);
    }
  }

  /**
   * Remove a card from the player's hand.
   * @param {number} index - The index of card to remove from the player's hand.
   */
  removeCardByIndex(index: number) {
    this.hand.splice(index, 1);
  }

  /**
   * Check if the player has a Nope card.
   * @returns {number} The index of the Nope card in the player's hand, or -1 if the player doesn't have a Nope card.
   */
  hasNopeCard() {
    for (let i = 0; i < this.hand.length; i++) {
      if (this.hand[i] instanceof card.NopeCard) {
        return i;
      }
    }
    return -1;
  }

  /**
   * Give a random card from the player's hand.
   * @returns {Card} The randomly selected card.
   */
  giveRandomCard() {
    const randomIndex = Math.floor(Math.random() * this.hand.length);
    const randomCard = this.hand[randomIndex];
    this.hand.splice(randomIndex, 1);
    return randomCard;
  }

  /**
   * Check if the player has a Defuse card in their hand.
   * @returns {number} The index of the Defuse card in the hand, or -1 if the player does not have one.
   */
  hasDefuseCard() {
    return this.hand.findIndex((cards) => cards instanceof card.DefuseCard);
  }

  hasPair(): number[] {
    const cardCounts: { [key: string]: number } = {};

    // Count the occurrences of each card rank in the player's hand
    this.hand.forEach((cards) => {
      if (cards instanceof card.NumberCard) {
        const rank = cards.rank;
        if (cardCounts.hasOwnProperty(rank)) {
          cardCounts[rank]++;
        } else {
          cardCounts[rank] = 1;
        }
      }
    });

    // Check if there's any pair in the cardCounts
    for (const rank in cardCounts) {
      if (cardCounts[rank] >= 2) {
        // Find the indices of the pair in the player's hand
        const indices: number[] = [];
        for (let i = 0; i < this.hand.length && indices.length < 2; i++) {
          const cards = this.hand[i];
          if (cards instanceof card.NumberCard && cards.rank === rank) {
            indices.push(i);
          }
        }
        return indices;
      }
    }
    return [];
  }
}

export default Player;
