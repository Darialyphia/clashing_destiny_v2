import type { CardSet } from '.';
import { CARD_SETS } from '../card.enums';
import { rustyBlade } from './core/artifacts/rusty-blade';
import { aidenLv1 } from './core/heroes/aiden-lv1';
import { noviceLv0 } from './core/heroes/novice-lv0';
import { courageousFootsoldier } from './core/minions/courageous-footsoldier';
import { fireBolt } from './core/spells/fire-bolt';

export const coreSet: CardSet = {
  id: CARD_SETS.CORE,
  name: 'Core Set',
  cards: [fireBolt, noviceLv0, aidenLv1, courageousFootsoldier, rustyBlade]
};
