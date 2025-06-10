import { CARDS_DICTIONARY } from '@game/engine/src/card/sets';
import type { GameOptions } from '@game/engine/src/game/game';

export type PremadeDeck = {
  name: string;
  mainDeck: GameOptions['players'][number]['mainDeck'];
  destinyDeck: GameOptions['players'][number]['destinyDeck'];
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

        'seer',
        'seer',
        'seer',
        'seer',

        'archsage-of-moonring',
        'archsage-of-moonring',
        'archsage-of-moonring',

        'phoenix',

        'recollection',
        'recollection',

        'hourglass-fracture'
      ]
    },

    destinyDeck: {
      cards: ['mage', 'sorcerer', 'sage', 'fire-studies', 'arcane-studies']
    }
  }
];
