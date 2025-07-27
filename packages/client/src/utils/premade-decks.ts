import type { GameOptions } from '@game/engine/src/game/game';

export type PremadeDeck = {
  name: string;
  mainDeck: GameOptions['players'][number]['mainDeck'];
  hero: GameOptions['players'][number]['hero'];
};

export const premadeDecks: Array<PremadeDeck> = [
  {
    name: 'Knight Starter Deck',
    mainDeck: {
      cards: [
        'fire-bolt',
        'fire-bolt',
        'fire-bolt',
        'fire-bolt',

        'fire-ball',
        'fire-ball',

        'inner-fire',
        'inner-fire',

        'forged-in-the-crater',
        'forged-in-the-crater',

        'friendly-slime',
        'friendly-slime',
        'friendly-slime',
        'friendly-slime',

        'pyromancer',
        'pyromancer',

        'flagbearer-of-flame',
        'flagbearer-of-flame',
        'flagbearer-of-flame',
        'flagbearer-of-flame',

        'hot-headed-recruit',
        'hot-headed-recruit',
        'hot-headed-recruit',
        'hot-headed-recruit',

        'flamefist-fighter',
        'flamefist-fighter',
        'flamefist-fighter',
        'flamefist-fighter',

        'courageous-footsoldier',
        'courageous-footsoldier',
        'courageous-footsoldier',
        'courageous-footsoldier',

        'firebrand',
        'firebrand',

        'rusty-blade',
        'rusty-blade',
        'rusty-blade',
        'rusty-blade',

        'sun-emperor',
        'sun-emperor',

        'phoenix'
      ]
    },

    hero: 'knight'
  }
];
