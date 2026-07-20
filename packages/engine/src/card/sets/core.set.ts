import type { CardSet } from '.';
import { CARD_SETS } from '../card.enums';
import { arcaneSight } from './core/spells/arcane/arcane-sight';
import { arcaneSpark } from './core/spells/arcane/arcane-spark';
import { astralBall } from './core/minions/arcane/astral-ball';
import { astralSage } from './core/minions/arcane/astral-sage';
import { birdOfGoodLuck } from './core/minions/neutral/bird-of-good-luck';
import { braveCitizen } from './core/minions/neutral/brave-citizen';
import { conjureFocus } from './core/spells/neutral/conjure-focus';
import { conjureMight } from './core/spells/neutral/conjure-might';
import { conjureResonance } from './core/spells/neutral/conjure-resonance';
import { conjureWisdom } from './core/spells/neutral/conjure-wisdom';
import { cremation } from './core/spells/fire/cremation';
import { crowdsFavor } from './core/destinies/crowds-favor';
import { dayOfConquest } from './core/destinies/day-of-conquest';
import { dayOfFortitude } from './core/destinies/day-of-fortitude';
import { engulfInFlames } from './core/spells/fire/engulf-in-flames';
import { enigmaticWizard } from './core/minions/arcane/enigmatic-wizard';
import { erinasApprentice } from './core/minions/arcane/erinas-apprentice';
import { erinaVioletWitch } from './core/heroes/erina-violet-witch';
import { fallingStar } from './core/spells/arcane/falling-star';
import { fireBall } from './core/spells/fire/fire-ball';
import { fireBolt } from './core/spells/fire/fire-bolt';
import { fireImp } from './core/minions/fire/fire-imp';
import { flameArchmage } from './core/minions/fire/flame-archmage';
import { haroldVowedCrusader } from './core/heroes/harold-vowed-crusader';
import { impassibleMonk } from './core/minions/earth/impassible-monk';
import { indomitableVindicator } from './core/minions/fire/indomitable-vindicator';
import { innerFire } from './core/spells/fire/inner-fire';
import { lesserFireSummoning } from './core/spells/fire/lesser-fire-summoning';
import { manaFueledGolem } from './core/minions/arcane/mana-fueled-golem';
import { manaWeaverApprentice } from './core/minions/arcane/mana-weaver-apprentice';
import { mountainProtector } from './core/minions/earth/mountain-protector';
import { mysticRecall } from './core/spells/arcane/mystic-recall';
import { pyromancer } from './core/minions/fire/pyromancer';
import { recklessRecruit } from './core/minions/fire/reckless-recruit';
import { repulsorShield } from './core/spells/arcane/repulsor-shield';
import { restrainTheBeast } from './core/destinies/restrain-the-beast';
import { rockSlideGolem } from './core/minions/earth/rock-slide-golem';
import { runicCatalyst } from './core/artifacts/arcane/runic-catalyst';
import { spellSiphon } from './core/spells/arcane/spell-siphon';
import { starConvergence } from './core/spells/arcane/star-convergence';
import { starSeer } from './core/minions/arcane/star-seer';
import { terramancer } from './core/minions/earth/terramancer';
import { twinFlame } from './core/spells/fire/twin-flame';
import { vineTrapper } from './core/minions/earth/vine-trapper';
import { willowisp } from './core/minions/fire/willowisp';
import { ashesOfPain } from './core/destinies/ashes-of-pain';
import { blastSorcerer } from './core/minions/fire/blast-sorcerer';
import { moltenSalamander } from './core/minions/fire/molten-salamander';
import { austerity } from './core/destinies/austerity';
import { cosmic } from './core/spells/arcane/cosmic-flurry';

export const coreSet: CardSet = {
  id: CARD_SETS.CORE,
  name: 'Core Set',
  cards: [
    arcaneSight,
    arcaneSpark,
    astralBall,
    astralSage,
    birdOfGoodLuck,
    braveCitizen,
    conjureFocus,
    conjureMight,
    conjureResonance,
    conjureWisdom,
    cremation,
    crowdsFavor,
    dayOfConquest,
    dayOfFortitude,
    engulfInFlames,
    enigmaticWizard,
    erinasApprentice,
    erinaVioletWitch,
    fallingStar,
    fireBall,
    fireBolt,
    fireImp,
    flameArchmage,
    haroldVowedCrusader,
    impassibleMonk,
    indomitableVindicator,
    innerFire,
    lesserFireSummoning,
    manaFueledGolem,
    manaWeaverApprentice,
    mountainProtector,
    mysticRecall,
    pyromancer,
    recklessRecruit,
    repulsorShield,
    restrainTheBeast,
    rockSlideGolem,
    runicCatalyst,
    spellSiphon,
    starConvergence,
    starSeer,
    terramancer,
    twinFlame,
    vineTrapper,
    willowisp,
    ashesOfPain,
    blastSorcerer,
    moltenSalamander,
    austerity,
    cosmic
  ]
};
