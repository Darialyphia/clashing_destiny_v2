import type { CardSet } from '.';
import { CARD_SETS } from '../card.enums';
import { erinaVioletWitch } from './core/heroes/index';
import { pyromancer, recklessRecruit, willowisp } from './core/minions/fire/index';
import {
  fireBolt,
  cremation,
  innerFire,
  fireBall,
  engulfInFlames,
  lesserFireSummoning
} from './core/spells/fire/index';
import { braveCitizen } from './core/minions/neutral/index';

export const coreSet: CardSet = {
  id: CARD_SETS.CORE,
  name: 'Core Set',
  cards: [
    erinaVioletWitch,
    fireBolt,
    pyromancer,
    braveCitizen,
    recklessRecruit,
    willowisp,
    cremation,
    innerFire,
    fireBall,
    engulfInFlames,
    lesserFireSummoning
  ]
};
