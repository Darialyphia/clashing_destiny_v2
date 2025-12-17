import type { CardSet } from '.';
import { CARD_SETS } from '../card.enums';
import { erinaLv1 } from './core/arcane/heroes/erina-lv1';
import { spiritOfArcane } from './core/arcane/heroes/spirit-of-arcane';
import { manaLooter } from './core/arcane/minions/mana-looter';

export const coreSet: CardSet = {
  id: CARD_SETS.CORE,
  name: 'Core Set',
  cards: [spiritOfArcane, erinaLv1, manaLooter]
};
