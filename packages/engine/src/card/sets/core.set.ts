import type { CardSet } from '.';
import { CARD_SETS } from '../card.enums';
import { erinaLv1 } from './core/arcane/heroes/erina-lv1';

export const coreSet: CardSet = {
  id: CARD_SETS.CORE,
  name: 'Core Set',
  cards: [erinaLv1]
};
