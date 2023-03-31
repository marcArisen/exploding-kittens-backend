import Game from '../src/game/game';
import Player from '../src/player/player';
import card from '../src/cards/models/card';

describe('Game', () => {
  let playerNames: string[];
  let game: Game;

  beforeEach(() => {
    playerNames = ['Alice', 'Bob', 'Charlie', 'David'];
    game = new Game(playerNames);
  });

  it('should create a new game with the specified players', () => {
    const players = game.getPlayers();
    expect(players).toHaveLength(4);
    expect(players[0].name).toBe('Alice');
    expect(players[1].name).toBe('Bob');
    expect(players[2].name).toBe('Charlie');
    expect(players[3].name).toBe('David');
  });
  it('should deal cards to each player', () => {
    game.dealCards();
    game.players.forEach((player) => {
      expect(player.hand).toHaveLength(4);
    });
  });

  it('should add Exploding Kitten card to the deck and shuffle', () => {
    game.addExplodingKittenCard();
    expect(game.deck.cards.filter((c) => c instanceof card.ExplodingKittenCard)).toHaveLength(4);
  });

  it('should give each player a Defuse Card', () => {
    game.givePlayerDefuseCard();
    game.players.forEach((player) => {
      expect(player.hand.some((c) => c instanceof card.DefuseCard)).toBeTruthy();
    });
  });

  it('should use the shuffle card effect', () => {
    const initialDeck = [...game.deck.cards];
    game.useShuffle();
    const shuffledDeck = game.deck.cards;
    // This test assumes that the shuffled deck is different from the initial deck. However, there is a small chance that the shuffled deck is the same as the initial one, causing a false negative.
    expect(shuffledDeck).not.toEqual(initialDeck);
  });

  it('should use the see the future card effect', () => {
    const peekedCards = game.useSeeTheFutureCard();
    expect(peekedCards).toHaveLength(3);
    expect(game.deck.cards.slice(0, 3)).toEqual(peekedCards);
  });

  it('should use the skip card effect', () => {
    const initialCurrentPlayer = game.currentPlayer;
    game.useSkipCard();
    expect(game.currentPlayer).not.toEqual(initialCurrentPlayer);
    game.attackStack = 1;
    const secondCurrentPlayer = game.currentPlayer;
    game.useSkipCard();
    expect(game.currentPlayer).toBe(secondCurrentPlayer);
  });

  it('should use the attack card effect', () => {
    const initialCurrentPlayer = game.currentPlayer;
    game.useAttackCard();
    expect(game.attackStack).toBe(1);
    expect(game.currentPlayer).not.toEqual(initialCurrentPlayer);
  });

  it('should use the favor card effect', () => {
    game.dealCards();
    const targetPlayer = game.nextPlayer();
    const initialTargetHandSize = targetPlayer.getHandLength();
    const initialCurrentPlayerHandSize = game.currentPlayer.getHandLength();
    game.useFavorCard(targetPlayer);
    expect(targetPlayer.getHandLength()).toBe(initialTargetHandSize - 1);
    expect(game.currentPlayer.getHandLength()).toBe(initialCurrentPlayerHandSize + 1);
  });

  it('should draw a card', () => {
    const initialDeckSize = game.deck.cards.length;
    const initialHandSize = game.currentPlayer.hand.length;
    game.drawCards();
    expect(game.currentPlayer.hand.length).toBe(initialHandSize + 1);
    expect(game.deck.cards.length).toBe(initialDeckSize - 1);
  });

  it('should explode when an exploding kitten card is drawn', () => {
    const explodingKittenCard = new card.ExplodingKittenCard();
    game.deck.cards.unshift(explodingKittenCard); // Add the exploding kitten card to the top of the deck
    expect(game.deck.cards[0]).toBe(explodingKittenCard);
    game.drawCards(); // Draw a card, which will be the exploding kitten card
    expect(game.diedPlayer).toHaveLength(1);
  });

  it('should defuse the exploding kitten card', () => {
    const defuseCard = new card.DefuseCard();
    game.currentPlayer.addCardToHand(defuseCard);
    const playerHandLength = game.currentPlayer.getHandLength();
    const explodingKittenCard = new card.ExplodingKittenCard();
    game.deck.cards.unshift(explodingKittenCard); // Add the exploding kitten card to the top of the deck
    expect(game.deck.cards[0]).toBe(explodingKittenCard);
    game.drawCards();
    expect(game.currentPlayer.getHandLength()).toBe(playerHandLength - 1);
    expect(game.diedPlayer).toHaveLength(0);
  });

  it('should choose player', () => {
    const targetPlayer = game.nextPlayer();
    const chosenPlayer = game.choosePlayer(targetPlayer);
    expect(targetPlayer).toBe(chosenPlayer);
  });

  it('should play nope card', () => {
    const nopeCard = new card.NopeCard();
    game.currentPlayer.addCardToHand(nopeCard);
    game.playNopeCard(game.currentPlayer, 0);
    expect(game.currentPlayer.getHandLength()).toBe(0);
  });
});
