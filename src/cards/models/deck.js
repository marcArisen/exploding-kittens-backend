const card = require('./card');

/**
 * Represents a deck of cards in the Exploding Kittens game.
 */
class Deck {
  /**
   * Create a new deck of cards.
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
   * Add a card to the bottom of the deck.
   * @param {Card} card - The card to add to the bottom of the deck.
   */
  add(card) {
    this.cards.push(card);
  }

  /**
   * Create a new deck of cards for the game.
   */
  createDeck() {
    const explodingKitten = new card.ExplodingKittenCard(true);

    // Add 4 Exploding Kitten cards to deck
    for (let i = 0; i < 4; i++) {
      this.add(explodingKitten);
    }

    // Add 6 Defuse cards to deck
    for (let i = 0; i < 6; i++) {
      this.add(new card.DefuseCard());
    }

    // Add 4 of each action card to deck
    for (let i = 0; i < 4; i++) {
      this.add(new card.SkipCard());
      this.add(new card.AttackCard());
      this.add(new card.FavorCard());
      this.add(new card.SeeTheFutureCard());
    }

    // Add 5 of each number card to deck
    for (let i = 0; i < 5; i++) {
      this.add(new card.NumberCard('1'));
      this.add(new card.NumberCard('2'));
      this.add(new card.NumberCard('3'));
      this.add(new card.NumberCard('4'));
      this.add(new card.NumberCard('5'));
    }
  }
}

module.exports = Deck;
