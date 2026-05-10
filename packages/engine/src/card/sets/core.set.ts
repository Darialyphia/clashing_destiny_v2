import type { CardSet } from '.';
import { CARD_SETS } from '../card.enums';
import { sample } from './core/neutral/minions/sample';
import { erinaVioletWitch } from './core/fire/heroes/erina-violet-witch';
import { sampl2 } from './core/neutral/minions/sample2';
import { sampleSpell } from './core/neutral/spells/sample-spell';
import { healingMystic } from './core/neutral/minions/healing-mystic';
import { fireBolt } from './core/fire/spells/fire-bolt';
import { littleWitch } from './core/neutral/minions/little-witch';
import { pyromancer } from './core/fire/minions/pyromancer';

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
    healingMystic,
    fireBolt,
    littleWitch,
    pyromancer
  ]
};
