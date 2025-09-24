import type { GameOptions } from '@game/engine/src/game/game';

export type PremadeDeck = {
  name: string;
  mainDeck: GameOptions['players'][number]['mainDeck'];
  destinyDeck: GameOptions['players'][number]['mainDeck'];
  hero: GameOptions['players'][number]['hero'];
};

export const premadeDecks: Array<PremadeDeck> = [
  {
    name: 'Knight Starter Deck',
    destinyDeck: {
      cards: []
    },
    mainDeck: {
      cards: []
    },

    hero: 'knight'
  }
];
