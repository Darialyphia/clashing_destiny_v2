import type { CardSet } from '.';
import { CARD_SETS } from '../card.enums';
import { sample } from './core/neutral/minions/sample';
import { runeOfEnigma } from './core/neutral/runes/rune-of-enigma';
import { runeOfFocus } from './core/neutral/runes/rune-of-focus';
import { runeOfMight } from './core/neutral/runes/rune-of-might';
import { runeOfResonance } from './core/neutral/runes/rune-of-resonance';
import { runeOfWisdom } from './core/neutral/runes/rune-of-wisdom';

export const coreSet: CardSet = {
  id: CARD_SETS.CORE,
  name: 'Core Set',
  cards: [sample, runeOfEnigma, runeOfFocus, runeOfMight, runeOfResonance, runeOfWisdom]
};
