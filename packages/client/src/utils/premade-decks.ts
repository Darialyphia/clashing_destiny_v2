import type { GameOptions } from '@game/engine/src/game/game';

export type PremadeDeck = {
  name: string;
  mainDeck: GameOptions['players'][number]['mainDeck'];
  hero: GameOptions['players'][number]['hero'];
};

export const premadeDecks: Array<PremadeDeck> = [
  {
    name: 'Mage Starter Deck',
    mainDeck: {
      cards: [
        'fire-bolt',
        'fire-bolt',
        'fire-bolt',
        'fire-bolt',

        'fire-ball',
        'fire-ball',
        'fire-ball',

        'inner-fire',
        'inner-fire',
        'inner-fire',

        'friendly-slime',
        'friendly-slime',
        'friendly-slime',
        'friendly-slime',

        'pyromancer',
        'pyromancer',
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
        'firebrand',
        'firebrand',

        'phoenix'
      ]
    },

    hero: 'warlock'
  }
];
