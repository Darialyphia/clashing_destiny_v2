import type { CardSet } from '.';
import { CARD_SETS } from '../card.enums';
import { erinaVioletWitch } from './core/fire/heroes/erina-violet-witch';
import { fireBolt } from './core/fire/spells/fire-bolt';
import { fireBall } from './core/fire/spells/fire-ball';

export const coreSet: CardSet = {
  id: CARD_SETS.CORE,
  name: 'Core Set',
  cards: [erinaVioletWitch, fireBolt, fireBall]
};
