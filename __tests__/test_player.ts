import Card from "../src/cards/models/card-base";
import DefuseCard from "../src/cards/models/defuse-card";
import ExplodingKittenCard from "../src/cards/models/exploding-kitten-card";
import NumberCard from "../src/cards/models/number-card";
import ShuffleCard from "../src/cards/models/shuffle-card";
import Player from "../src/player/player";

describe("Player system", () => {
    let me:Player = new Player("Inanna")

    test("My name", () => {
        expect(me.getName()).toEqual("Inanna")
    })

    test("There a exploding cat on my hand?! (Test adding card and card length function", () => {
        me.addCardToHand(new ExplodingKittenCard())
        expect(me.getHandLength()).toEqual(1)
    })

    test("Is it a TRUE exploding kitten?!", () => {
        expect(me.getCardbyIndex(0) instanceof ExplodingKittenCard).toEqual(true)
    })

    test("Let compare hand!", () => {
        me.addCardToHand(new ExplodingKittenCard())
        let another:Player = me
        expect(another.getHand().every((card) => me.getHand().includes(card))).toEqual(true)
    })

    test("Discard from my hand", () => {
        let my_hand = me.getHandLength()
        me.removeCardFromHand(ExplodingKittenCard)
        expect(me.getHandLength()).toEqual(my_hand)
    })

    test("Has Nope?", () => {
        expect(me.hasNopeCard()).toEqual(-1)
    })

    //I have to comeback and do randomcard function test

    test("has Defuse Card", () => {
        let another_me:Player = new Player("Ningal")
        another_me.addCardToHand( new DefuseCard())
        expect(another_me.hasDefuseCard()).toEqual(0)
    })

    test("has pair cards", () => {
        let multi_me:Player = new Player("Ninkigal")
        multi_me.addCardToHand(new NumberCard('Tacocat'))
        multi_me.addCardToHand(new NumberCard('Tacocat'))
        expect(multi_me.hasPair()).toEqual([0,1])
    }

    )

})