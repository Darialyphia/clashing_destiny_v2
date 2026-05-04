import type { CardSet } from '.';
import { CARD_SETS } from '../card.enums';
import { sample } from './core/neutral/minions/sample';
import { erinaVioletWitch } from './core/mage/heroes/erina-violet-witch';
import { sampl2 } from './core/neutral/minions/sample2';
import { sampleSpell } from './core/neutral/spells/sample-spell';
import { healingMystic } from './core/neutral/minions/healing-mystic';

export const coreSet: CardSet = {
  id: CARD_SETS.CORE,
  name: 'Core Set',
  cards: [
    sample,
    sample,
    erinaVioletWitch,
    erinaVioletWitch,
    sample,
    sampl2,
    sampleSpell,
    healingMystic
  ]
};
