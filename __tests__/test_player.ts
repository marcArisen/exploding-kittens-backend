import Card from "../src/cards/models/card-base";
import DefuseCard from "../src/cards/models/defuse-card";
import ExplodingKittenCard from "../src/cards/models/exploding-kitten-card";
import NumberCard from "../src/cards/models/number-card";
import ShuffleCard from "../src/cards/models/shuffle-card";
import NopeCard from "../src/cards/models/nope-card";
import Player from "../src/player/player";

describe("Player system", () => {
    let me:Player = new Player("Inanna")

    test("My name", () => {
        expect(me.getName()).toEqual("Inanna")
    });

    test("There a exploding cat on my hand?! (Test adding card and card length function", () => {
        me.addCardToHand(new ExplodingKittenCard())
        expect(me.getHandLength()).toEqual(1)
    });

    test("Is it a TRUE exploding kitten?!", () => {
        expect(me.getCardbyIndex(0) instanceof ExplodingKittenCard).toEqual(true)
    });

    test("Let compare hand!", () => {
        me.addCardToHand(new ExplodingKittenCard())
        let another:Player = me
        expect(another.getHand().every((card) => me.getHand().includes(card))).toEqual(true)
    });

    test("Discard from my hand", () => {
        let my_hand = me.getHandLength();
        let cardToRemove = me.getCardbyIndex(0);
        me.removeCardFromHand(cardToRemove);
        expect(me.getHandLength()).toEqual(my_hand - 1);
    });
      

    test("Has Nope?", () => {
        expect(me.hasNopeCard()).toEqual(-1)
        me.addCardToHand(new NopeCard());
        expect(me.hasNopeCard()).not.toEqual(-1);
    });

    test("has Defuse Card", () => {
        let another_me:Player = new Player("Ningal")
        another_me.addCardToHand( new DefuseCard())
        expect(another_me.hasDefuseCard()).toEqual(0)
    });

    test("has pair cards", () => {
        let multi_me:Player = new Player("Ninkigal")
        multi_me.addCardToHand(new NumberCard('Tacocat'))
        multi_me.addCardToHand(new NumberCard('Tacocat'))
        expect(multi_me.hasPair()).toEqual([0,1])
    });

    test("do not have pair cards", () => {
        let multi_me:Player = new Player("Ninkigal")
        multi_me.addCardToHand(new NumberCard('Bread Cat'))
        expect(multi_me.hasPair()).toEqual([])
    });
    
    test("Give a random card from the player's hand", () => {
        me.addCardToHand(new NumberCard('Card1'));
        me.addCardToHand(new NumberCard('Card2'));
        me.addCardToHand(new NumberCard('Card3'));
      
        const initialHandLength = me.getHandLength();
        const randomCard = me.giveRandomCard();
      
        expect(randomCard).toBeInstanceOf(Card);
        expect(me.getHandLength()).toEqual(initialHandLength - 1);
        expect(me.getHand().includes(randomCard)).toBeFalsy();
      });   
});