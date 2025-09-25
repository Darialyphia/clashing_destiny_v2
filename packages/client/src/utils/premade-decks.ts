import type { GameOptions } from '@game/engine/src/game/game';

export type PremadeDeck = {
  name: string;
  mainDeck: GameOptions['players'][number]['mainDeck'];
  destinyDeck: GameOptions['players'][number]['mainDeck'];
};

export const premadeDecks: Array<PremadeDeck> = [
  {
    name: 'Aiden Starter',
    mainDeck: {
      cards: [
        'courageous-footsoldier',
        'courageous-footsoldier',
        'courageous-footsoldier',
        'courageous-footsoldier',
        'courageous-footsoldier',
        'courageous-footsoldier',
        'courageous-footsoldier',
        'courageous-footsoldier',

        'fire-bolt',
        'fire-bolt',
        'fire-bolt',
        'fire-bolt',
        'fire-bolt',
        'fire-bolt',
        'fire-bolt',
        'fire-bolt',

        'rusty-blade',
        'rusty-blade',
        'rusty-blade',
        'rusty-blade',
        'rusty-blade',
        'rusty-blade',
        'rusty-blade',
        'rusty-blade'
      ]
    },
    destinyDeck: {
      cards: ['aiden-lv1']
    }
  }
];
