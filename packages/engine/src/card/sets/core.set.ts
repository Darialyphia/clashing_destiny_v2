import type { CardSet } from '.';
import { CARD_SETS } from '../card.enums';
import { sample } from './core/neutral/minions/sample';
import { erina } from './core/mage/heroes/erina';
import { carefulStudy } from './core/neutral/destinies/careful-study';
import { sample2 } from './core/neutral/minions/sample2';

export const coreSet: CardSet = {
  id: CARD_SETS.CORE,
  name: 'Core Set',
  cards: [erina, sample, carefulStudy, sample2]
};
