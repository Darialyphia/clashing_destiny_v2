import type { CardSet } from '.';
import { CARD_SETS } from '../card.enums';
import { elementalist } from './core/heroes/elementalist';
import { mage } from './core/heroes/mage';
import { novice } from './core/heroes/novice';
import { sage } from './core/heroes/sage';
import { sorcerer } from './core/heroes/sorcerer';
import { warlock } from './core/heroes/warlock';
import { fireBolt } from './core/spells/fire-bolt';

export const coreSet: CardSet = {
  id: CARD_SETS.CORE,
  name: 'Core Set',
  cards: [novice, mage, elementalist, sage, sorcerer, warlock, fireBolt]
};
