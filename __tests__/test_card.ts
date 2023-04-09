import Card from '../src/cards/models/card-base';

describe('Card test', () => {
  let card = new Card('1', 'Number');

  test('should get card Name', () => {
    expect(card.getName()).toBe('1');
  });

  test('should get card Type', () => {
    expect(card.getType()).toBe('Number');
  });
});
