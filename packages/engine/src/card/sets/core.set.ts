import type { CardSet } from '.';
import { CARD_SETS } from '../card.enums';
import { rustyBlade } from './core/artifacts/rusty-blade';
import { knight } from './core/heroes/knight';
import { sage } from './core/heroes/sage';
import { courageousFootsoldier } from './core/minions/courageous-footsoldier';
import { fireBolt } from './core/spells/fire-bolt';

export const coreSet: CardSet = {
  id: CARD_SETS.CORE,
  name: 'Core Set',
  cards: [fireBolt, knight, sage, courageousFootsoldier, rustyBlade]
};
