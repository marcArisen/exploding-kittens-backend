import Card from './card-base';

/* eslint-disable prettier/prettier */
const card = require('./card');

/**
 * Represents a deck of cards in the game.
 */
class Deck {
  cards: Array<Card>;
  /**
   * Create a new deck of cards for the game.
   */
  constructor() {
    this.cards = [];
    this.createDeck();
    this.shuffle();
  }

  /**
   * Shuffle the deck of cards.
   */
  shuffle() {
    let currentIndex = this.cards.length;
    let temporaryValue;
    let randomIndex;

    // While there remain elements to shuffle...
    while (currentIndex !== 0) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = this.cards[currentIndex];
      this.cards[currentIndex] = this.cards[randomIndex];
      this.cards[randomIndex] = temporaryValue;
    }
  }

  /**
   * Draw a card from the top of the deck.
   * @return {Card} - The card drawn from the top of the deck.
   */
  draw() {
    return this.cards.shift();
  }

  /**
   * Get an array of the top n cards in the deck without modifying the deck.
   * @param {number} count - The number of cards to peek.
   * @return {Array} - The top n cards in the deck.
   */
  peek(count) {
    return this.cards.slice(0, count);
  }

  /**
   * Add a card to the bottom of the deck.
   * @param {Card} card - The card to add to the bottom of the deck.
   * @param {number} amount - The amount to add to the bottom of the deck.
   */
  addcards(card, amount) {
    for (let i = 0; i < amount; i++) {
      this.cards.push(card);
    }
  }

  /**
   * Create a new deck of cards for the game.
   */
  createDeck() {
    // Add 2 Defuse cards to deck
    this.addcards(new card.DefuseCard(), 2);

    // Add 4 of each action card to deck
    this.addcards(new card.SkipCard(), 4);
    this.addcards(new card.AttackCard(), 4);
    this.addcards(new card.FavorCard(), 4);
    this.addcards(new card.SeeTheFutureCard(), 4);
    this.addcards(new card.NopeCard(), 4);
    this.addcards(new card.ShuffleCard(), 4);

    // Add 5 of each number card to deck
    this.addcards(new card.NumberCard('Tacocat'), 5);
    this.addcards(new card.NumberCard('Hairy Potato Cat'), 5);
    this.addcards(new card.NumberCard('Rainbow-Ralphing Cat'), 5);
    this.addcards(new card.NumberCard('Beard Cat'), 5);
    this.addcards(new card.NumberCard('Cattermelon'), 5);
    this.addcards(new card.NumberCard('Zombie Cat'), 5);
  }

  /**
   * Put 4 exploding kitten into the deck
   */
  generateBombedCat() {
    this.addcards(new card.ExplodingKittenCard(), 4);
  }

  /**
   * Generate 1 defuse
   */
  generateDefuse() {
    this.addcards(new card.DefuseCard(), 1);
  }
}

export default Deck;