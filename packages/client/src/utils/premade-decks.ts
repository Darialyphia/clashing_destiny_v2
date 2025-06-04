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

        'flagBearerOfFlame',
        'flagBearerOfFlame',
        'flagBearerOfFlame',
        'flagBearerOfFlame',

        'pyromancer',
        'pyromancer',
        'pyromancer',
        'pyromancer',

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

        'archsageOfMoonring',
        'archsageOfMoonring',

        'phoenix'
      ]
    },

    destinyDeck: {
      cards: ['mage', 'elementalist', 'sage', 'fire-studies']
    }
  }
];
