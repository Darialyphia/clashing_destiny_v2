import type { CardSet } from '.';
import { CARD_SETS } from '../card.enums';
import { sample } from './core/neutral/minions/sample';
import { runeOfAir } from './core/neutral/runes/rune-of-air';
import { runeOfDark } from './core/neutral/runes/rune-of-dark';
import { runeOfEarth } from './core/neutral/runes/rune-of-earth';
import { runeOfFire } from './core/neutral/runes/rune-of-fire';
import { runeOfLight } from './core/neutral/runes/rune-of-light';
import { runeOfWater } from './core/neutral/runes/rune-of-water';

export const coreSet: CardSet = {
  id: CARD_SETS.CORE,
  name: 'Core Set',
  cards: [
    sample,
    runeOfAir,
    runeOfDark,
    runeOfEarth,
    runeOfFire,
    runeOfLight,
    runeOfWater
  ]
};
