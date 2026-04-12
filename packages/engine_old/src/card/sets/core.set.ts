import type { CardSet } from '.';
import { CARD_SETS } from '../card.enums';
import { sample } from './core/neutral/minions/sample';
import { erinaVioletWitch } from './core/mage/heroes/erina-violet-witch';

export const coreSet: CardSet = {
  id: CARD_SETS.CORE,
  name: 'Core Set',
  cards: [sample, erinaVioletWitch, sample, erinaVioletWitch, sample]
};
