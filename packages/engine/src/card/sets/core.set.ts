import type { CardSet } from '.';
import { CARD_SETS } from '../card.enums';
import { erinaVioletWitch } from './core/heroes/index';
import {
  pyromancer,
  recklessRecruit,
  willowisp,
  fireImp,
  flameArchmage,
  indomitableVindicator
} from './core/minions/fire/index';
import {
  fireBolt,
  cremation,
  innerFire,
  fireBall,
  engulfInFlames,
  lesserFireSummoning,
  twinFlame
} from './core/spells/fire/index';
import { braveCitizen, birdOfGoodLuck } from './core/minions/neutral/index';
import {
  dayOfFortitude,
  dayOfConquest,
  restrainTheBeast,
  crowdsFavor
} from './core/destinies/index';
import {
  arcaneSight,
  repulsorShield,
  fallingStar,
  arcaneSpark,
  mysticRecall,
  starConvergence
} from './core/spells/arcane/index';
import {
  starSeer,
  manaWeaverApprentice,
  manaFueledGolem,
  erinasApprentice,
  enigmaticWizard,
  astralBall,
  astralSage
} from './core/minions/arcane/index';
import {
  conjureMight,
  conjureWisdom,
  conjureFocus,
  conjureResonance
} from './core/spells/neutral/index';

export const coreSet: CardSet = {
  id: CARD_SETS.CORE,
  name: 'Core Set',
  cards: [
    erinaVioletWitch,
    fireBolt,
    pyromancer,
    braveCitizen,
    birdOfGoodLuck,
    recklessRecruit,
    willowisp,
    cremation,
    innerFire,
    fireBall,
    engulfInFlames,
    lesserFireSummoning,
    dayOfFortitude,
    dayOfConquest,
    fireImp,
    flameArchmage,
    arcaneSight,
    conjureMight,
    conjureWisdom,
    conjureFocus,
    conjureResonance,
    arcaneSpark,
    repulsorShield,
    fallingStar,
    starSeer,
    manaWeaverApprentice,
    mysticRecall,
    starConvergence,
    restrainTheBeast,
    crowdsFavor,
    manaFueledGolem,
    erinasApprentice,
    enigmaticWizard,
    astralBall,
    indomitableVindicator,
    twinFlame,
    astralSage
  ]
};
