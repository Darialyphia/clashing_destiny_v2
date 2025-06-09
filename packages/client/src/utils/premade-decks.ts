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
        'fire-ball',

        'pyroclasm',
        'pyroclasm',

        'inner-fire',
        'inner-fire',
        'inner-fire',
        'inner-fire',

        'arcane-ray',
        'arcane-ray',
        'arcane-ray',

        'pyromancer',
        'pyromancer',
        'pyromancer',
        'pyromancer',

        'flagbearer-of-flame',
        'flagbearer-of-flame',
        'flagbearer-of-flame',
        'flagbearer-of-flame',

        'flamefist-fighter',
        'flamefist-fighter',
        'flamefist-fighter',
        'flamefist-fighter',

        'seer',
        'seer',
        'seer',
        'seer',

        'magic-channeler',
        'magic-channeler',
        'magic-channeler',
        'magic-channeler',

        'archsage-of-moonring',
        'archsage-of-moonring',

        'phoenix'
      ]
    },

    destinyDeck: {
      cards: ['mage', 'elementalist', 'sage', 'fire-studies']
    }
  }
];
