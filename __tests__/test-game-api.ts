import Game from '../src/game/game';
import Player from '../src/player/player';
import card from '../src/cards/models/card';
import { log } from 'console';

describe('Game', () => {
  let playerNames: string[];
  let game: Game;

  beforeEach(() => {
    playerNames = ['Alice', 'Bob', 'Charlie', 'David'];
    game = new Game(playerNames, () => {},() => {},() => {}, () => {});
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

    const updateDeckSize = game.deck.cards.length;
    const updatedHandSize = game.currentPlayer.getHandLength();
    game.attackStack = 1;
    game.drawCards();
    expect(game.currentPlayer.hand.length).toBe(updatedHandSize + 2);
    expect(game.deck.cards.length).toBe(updateDeckSize - 2);
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
    const targetPlayer = game.currentPlayer;
    const chosenPlayer = game.choosePlayer(targetPlayer);
    expect(targetPlayer).not.toBe(chosenPlayer);
  });

  it('should play nope card', () => {
    const nopeCard = new card.NopeCard();
    game.currentPlayer.addCardToHand(nopeCard);
    game.playNopeCard(game.currentPlayer, 0);
    expect(game.currentPlayer.getHandLength()).toBe(0);
  });

  it('should play a card and trigger its effect', async () => {
    const targetPlayer = game.nextPlayer();
    const attackCard = new card.AttackCard();
    game.currentPlayer.addCardToHand(attackCard);
    const cardIndex = game.currentPlayer.getHandLength() - 1;
    const requestPlayNopeCallback = async (player: Player) => null;
    const updateStateCallback = () => {};
    const notifyNopeCallback = () => {};

    await game.playCard(game.currentPlayer, cardIndex, requestPlayNopeCallback, updateStateCallback, notifyNopeCallback);

    expect(game.currentPlayer.getHandLength()).toBe(cardIndex);
    expect(game.attackStack).toBe(1);
  });

  it('player doesnt play any card', async () => {
    const attackCard = new card.AttackCard();
    game.currentPlayer.addCardToHand(attackCard);
    const requestPlayNopeCallback = async (player: Player) => null;
    const updateStateCallback = () => {};
    const notifyNopeCallback = () => {};

    const playedCard = await game.playCard(game.currentPlayer, -1, requestPlayNopeCallback, updateStateCallback, notifyNopeCallback);

    expect(playedCard).toBe(null);
  });

  it('should play a nope card and update the game state', () => {
    const nopeCard = new card.NopeCard();
    game.currentPlayer.addCardToHand(nopeCard);
    const cardIndex = game.currentPlayer.getHandLength() - 1;

    game.playNopeCard(game.currentPlayer, cardIndex);

    expect(game.currentPlayer.getHandLength()).toBe(cardIndex);
    expect(game.lastPlayedCard).toBe(nopeCard);
  });

  it('should wait for nope and return false if nope is not played', async () => {
    const requestPlayNopeCallback = async (player: Player) => null;
    const notifyNopeCallback = () => {};
    const nopeResult = await game.waitForNope(requestPlayNopeCallback, notifyNopeCallback);
    expect(nopeResult).toBe(false);
  });

  // it('should wait for nope and return true if nope is played', async () => {
  //   game.currentPlayer = game.players[0];
  //   const nopeCard = new card.NopeCard();
  //   game.currentPlayer.addCardToHand(nopeCard);
  //   const requestPlayNopeCallback: any = (player: Player) => new Promise((resolve) => setTimeout(() => resolve('bob'), 100));
  //   const notifyNopeCallback = () => {};
  //   const nopeResult = await game.waitForNope(requestPlayNopeCallback, notifyNopeCallback);
  //   expect(nopeResult).toBe(true);
  // });
  it('forces a specific player to play a Nope card', async () => {
    // Add a Nope card to targetPlayer's hand
    game.currentPlayer = game.players[0];
    const targetPlayer = game.players[1];
    targetPlayer.addCardToHand(card.NopeCard);
  
    // Force targetPlayer to play a Nope card
    const forcedPlayerName = targetPlayer.name;
    const testDelay = 100;
    const requestPlayNopeMock = async (player: Player) => {
    return new Promise<string | null>((resolve) => {
      setTimeout(() => {
        if (player.name === forcedPlayerName) {
          resolve(forcedPlayerName);
        } else {
          resolve(null);
        }
      }, testDelay/10);
    });
  };

  const notifyNopeCallback = () => {};
  const nopePlayed = await game.waitForNope(requestPlayNopeMock, notifyNopeCallback, 0, game.lastNopePlayer, testDelay);

  expect(nopePlayed).toBe(true);
});
  
  
  

  it('should return the current game state', () => {
    // Set up the game state
    const currentPlayer = game.currentPlayer;
    const allPlayers = game.allPlayers;
    const currentPlayerIndex = game.players.findIndex((player) => player === currentPlayer);
    const lastPlayedCard = new card.AttackCard();
    const numberOfPlayers = game.players.length;
    const turn = game.turn;
    currentPlayer.addCardToHand(lastPlayedCard);
    const requestPlayNopeCallback = async (player: Player) => null;
    const updateStateCallback = () => {};
    const notifyNopeCallback = () => {};
    const lastNopePlayer = game.lastNopePlayer;
    game.playCard(currentPlayer, currentPlayer.getHandLength() - 1, requestPlayNopeCallback, updateStateCallback, notifyNopeCallback);
    
    //Call the getCurrentState method
    const currentState = game.getCurrentState();

    //Check that the returned game state matches the expected state
    expect(currentState.players).toEqual(game.players);
    expect(currentState.deck).toEqual(game.deck);
    expect(currentState.discardPile).toEqual(game.discardPile);
    expect(currentState.turn).toBe(turn);
    expect(currentState.numberOfPlayers).toBe(numberOfPlayers);
    expect(currentState.currentPlayerIndex).toBe(currentPlayerIndex % numberOfPlayers);
    expect(currentState.currentPlayer).toBe(game.currentPlayer);
    expect(currentState.diedPlayer).toEqual(game.diedPlayer);
    expect(currentState.attackStack).toBe(game.attackStack);
    expect(currentState.lastPlayedCard).toBe(lastPlayedCard);
    expect(currentState.allPlayers).toBe(allPlayers);
    expect(currentState.lastNopePlayer).toBe(lastNopePlayer);
  });

  it('should use number card and trigger its effect', () => {
    const numberCard = new card.NumberCard('test');
    game.currentPlayer.addCardToHand(numberCard);
    game.currentPlayer.addCardToHand(numberCard);
    const initialHandSize = game.currentPlayer.getHandLength();
    const cardIndices = game.currentPlayer.hasPair();

    expect(initialHandSize).toBe(2);
    expect(cardIndices.length).toBe(2);
    game.useNumberCard(game.currentPlayer, cardIndices);

    //target player doesn't have any cards left
    expect(game.currentPlayer.getHandLength()).toBe(0);

    game.currentPlayer.addCardToHand(numberCard);
    game.currentPlayer.addCardToHand(numberCard);

    game.players.forEach((player) => {
      if (player !== game.currentPlayer) {
        player.addCardToHand(numberCard);
      }
    });
    const cardIndices1 = game.currentPlayer.hasPair();
    game.useNumberCard(game.currentPlayer, cardIndices1);
    //target player has cards left.
    expect(game.currentPlayer.getHandLength()).toBe(1);
    const initialHandSize1 = game.currentPlayer.getHandLength();
    const cardIndices2 = game.currentPlayer.hasPair();
    game.useNumberCard(game.currentPlayer, cardIndices2);
    expect(initialHandSize1).toBe(game.currentPlayer.getHandLength());
  });

  it('Play a NumberCard', async () => {
    game.currentPlayer.addCardToHand(new card.NumberCard('Beard Cat'));
    game.currentPlayer.addCardToHand(new card.NumberCard('Beard Cat'));
    const requestPlayNopeCallback = async (player: Player) => null;
    const updateStateCallback = () => {};
    const notifyNopeCallback = () => {};

    await game.playCard(game.currentPlayer, game.currentPlayer.hand.length - 1,
      requestPlayNopeCallback,
      updateStateCallback,
      notifyNopeCallback
    );

    expect(game.discardPile[game.discardPile.length - 1]).toBeInstanceOf(card.NumberCard);
    expect(game.discardPile[game.discardPile.length - 1].getName()).toEqual('Beard Cat');
    expect(game.currentPlayer.getHandLength()).toEqual(0);
  });

  it('Play a ShuffleCard', async () => {
    game.currentPlayer.addCardToHand(new card.ShuffleCard());
    const requestPlayNopeCallback = async (player: Player) => null;
    const updateStateCallback = () => {};
    const notifyNopeCallback = () => {};
    await game.playCard(game.currentPlayer, game.currentPlayer.hand.length - 1,requestPlayNopeCallback,
      updateStateCallback,
      notifyNopeCallback
    );

    expect(game.discardPile[game.discardPile.length - 1]).toBeInstanceOf(card.ShuffleCard);
    expect(game.discardPile[game.discardPile.length - 1].getName()).toEqual('Shuffle');
    expect(game.currentPlayer.getHandLength()).toEqual(0);
  });

  it('Play a NopeCard', async () => {
    game.currentPlayer.addCardToHand(new card.NopeCard());
    const requestPlayNopeCallback = async (player: Player) => null;
    const updateStateCallback = () => {};
    const notifyNopeCallback = () => {};

    await game.playCard(game.currentPlayer, game.currentPlayer.hand.length - 1,requestPlayNopeCallback,
      updateStateCallback,
      notifyNopeCallback
    );

    expect(game.discardPile[game.discardPile.length - 1]).toBeInstanceOf(card.NopeCard);
    expect(game.discardPile[game.discardPile.length - 1].getName()).toEqual('Nope');
    expect(game.currentPlayer.getHandLength()).toEqual(0);
  });

  it('Play a See The Future Card', async () => {
    game.currentPlayer.addCardToHand(new card.SeeTheFutureCard());
    const requestPlayNopeCallback = async (player: Player) => null;
    const updateStateCallback = () => {};
    const notifyNopeCallback = () => {};

    await game.playCard(game.currentPlayer, game.currentPlayer.hand.length - 1,requestPlayNopeCallback,
      updateStateCallback,
      notifyNopeCallback
    );

    expect(game.discardPile[game.discardPile.length - 1]).toBeInstanceOf(card.SeeTheFutureCard);
    expect(game.discardPile[game.discardPile.length - 1].getName()).toEqual('See the Future');
    expect(game.currentPlayer.getHandLength()).toEqual(0);
  });

  it('Play a SkipCard', async () => {
    game.currentPlayer.addCardToHand(new card.SkipCard());

    const requestPlayNopeCallback = async (player: Player) => null;
    const updateStateCallback = () => {};
    const notifyNopeCallback = () => {};

    await game.playCard(game.currentPlayer, game.currentPlayer.hand.length - 1,requestPlayNopeCallback,
      updateStateCallback,
      notifyNopeCallback
    );

    expect(game.discardPile[game.discardPile.length - 1]).toBeInstanceOf(card.SkipCard);
    expect(game.discardPile[game.discardPile.length - 1].getName()).toEqual('Skip');
    expect(game.currentPlayer.getHandLength()).toEqual(0);
  });

  it('Play a FavorCard', async () => {
    game.currentPlayer.addCardToHand(new card.FavorCard());

    const requestPlayNopeCallback = async (player: Player) => null;
    const updateStateCallback = () => {};
    const notifyNopeCallback = () => {};

    await game.playCard(game.currentPlayer, game.currentPlayer.hand.length - 1,requestPlayNopeCallback,
      updateStateCallback,
      notifyNopeCallback
    );

    expect(game.discardPile[game.discardPile.length - 1]).toBeInstanceOf(card.FavorCard);
    expect(game.discardPile[game.discardPile.length - 1].getName()).toEqual('Favor');
    expect(game.currentPlayer.getHandLength()).toEqual(0);
  });
  it('Action card effect should not work when Nope card is played', async () => {
    game.currentPlayer.addCardToHand(new card.AttackCard());
    let nopePlayer = game.nextPlayer();
    nopePlayer.addCardToHand(new card.NopeCard());
    console.log('Game state:', game.getCurrentState());
    // Mock the requestPlayNopeCallback to return true only for the nopePlayer
    const mockRequestPlayNopeCallback = async (player: Player) => {
      return new Promise<string | null>((resolve) => {
        setTimeout(() => {
          if (player.name === nopePlayer.name) {
            resolve(nopePlayer.name);
          } else {
            resolve(null);
          }
        }, 1); // Set the delay to half of the testDelay
      });
    };

    // Play the AttackCard
    const requestPlayNopeCallback = async (player: Player) => null;
    const updateStateCallback = () => {};
    const notifyNopeCallback = () => {};

    await game.playCard(game.currentPlayer, game.currentPlayer.hand.length - 1, mockRequestPlayNopeCallback,
      updateStateCallback,
      notifyNopeCallback
    );

    // Check if the last card in the discardPile is the Nope card
    console.log('Game state:', game.getCurrentState());
    console.log('Discard pile:', game.discardPile);
    expect(game.discardPile[game.discardPile.length - 1]).toBeInstanceOf(card.NopeCard);
    expect(game.discardPile[game.discardPile.length - 1].getName()).toEqual('Nope');

    // Check if the action card effect is not applied (attackStack remains 0)
    expect(game.attackStack).toBe(0);
  });

  it('Action card effect should work when Doubled Nope card is played', async () => {
    game.currentPlayer.addCardToHand(new card.AttackCard());
    let nopePlayer = game.nextPlayer();
    nopePlayer.addCardToHand(new card.NopeCard());
    console.log('Game state:', game.getCurrentState());
    // Mock the requestPlayNopeCallback to return true only for the nopePlayer
    // const mockRequestPlayNopeCallback = async (player: Player) => {
    //   return player !== game.currentPlayer;
    // };

    // Play the AttackCard
    const mockRequestPlayNopeCallback = async (player: Player) => {
      return new Promise<string | null>((resolve) => {
        setTimeout(() => {
          if (player.name === nopePlayer.name) {
            resolve(nopePlayer.name);
          } else {
            resolve(null);
          }
        }, 10); // Set the delay to half of the testDelay
      });
    };

    // Play the AttackCard
    const requestPlayNopeCallback = async (player: Player) => null;
    const updateStateCallback = () => {};
    const notifyNopeCallback = () => {};

    await game.playCard(game.currentPlayer, game.currentPlayer.hand.length - 1, mockRequestPlayNopeCallback,
      updateStateCallback,
      notifyNopeCallback
    );

    // Check if the last card in the discardPile is the Nope card
    console.log('Game state:', game.getCurrentState());
    console.log('Discard pile:', game.discardPile);
    expect(game.discardPile[game.discardPile.length - 1]).toBeInstanceOf(card.NopeCard);
    expect(game.discardPile[game.discardPile.length - 1].getName()).toEqual('Nope');

    // Check if the action card effect is not applied (attackStack remains 0)
    expect(game.attackStack).toBe(0);
  });
});
