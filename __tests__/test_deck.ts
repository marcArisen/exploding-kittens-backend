import Deck from "../src/cards/models/deck";

describe("Deck information", () => {
    let deck:Deck = new Deck()

    test("total card in the deck",() =>{
        expect(deck.cards.length).toEqual(56)
        }
    )

    test("shuffle work?",() =>{
        let temp_deck:Deck = deck
        temp_deck.shuffle()
        expect(deck.cards.every((card) => temp_deck.cards.includes(card))).toEqual(true)
    })

    test("俺のターン!! Draw!!",() =>{
        let deck_size = deck.cards.length
        deck.draw()
        expect(deck.cards.length).not.toEqual(deck_size)
    })

    test("Peek card",() => {
        let deck_size = deck.cards.length
        deck.peek(3)
        expect(deck.cards.length).toEqual(deck_size)
    })

    test("Borbadier Cat",() => {
        let deck_size = deck.cards.length
        deck.generateBombedCat()
        expect(deck.cards.length).not.toEqual(deck_size)
    })

})