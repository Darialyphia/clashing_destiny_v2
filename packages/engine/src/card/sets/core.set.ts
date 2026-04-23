import type { CardSet } from '.';
import { CARD_SETS } from '../card.enums';
import { sample } from './core/neutral/minions/sample';
import { erina } from './core/mage/heroes/erina';
import { carefulStudy } from './core/neutral/destinies/careful-study';
import { sample2 } from './core/neutral/minions/sample2';
import { fireBolt } from './core/mage/spells/fire-bolt';
import { frostShock } from './core/mage/spells/frost-shock';
import { wizardTutor } from './core/mage/minions/wizard-tutor';
import { manaFueledGolem } from './core/mage/minions/mana-fueled-golem';
import { apprenticeMagician } from './core/mage/minions/apprentice-magician';
import { arcaneMaster } from './core/mage/minions/arcane-master';
import { orbPonderer } from './core/mage/minions/orb-ponderer';
import { gargoyle } from './core/mage/minions/gargoyle';
import { cosmicAvatar } from './core/mage/minions/cosmic-avatar';
import { lightningStrike } from './core/mage/spells/lightning-strike';
import { fireMastery } from './core/mage/destinies/fire-mastery';
import { fireBall } from './core/mage/spells/fire-ball';
import { shootingStar } from './core/mage/destinies/shooting-star';
import { amplifyMagic } from './core/mage/spells/amplify-magic';
import { elementalWisdom } from './core/elementalist/spells/elemental-wisdom';
import { fireShard } from './core/mage/spells/fire-shard';
import { waterShard } from './core/mage/spells/water-shard';
import { airShard } from './core/mage/spells/air-shard';
import { earthShard } from './core/mage/spells/earth-shard';
import { elementalistPath } from './core/mage/destinies/elementalist-path';
import { wheelOfTheElements } from './core/elementalist/artifacts/wheel-of-the-elements';
import { pyromancer } from './core/mage/minions/pyromancer';
import { peerIntoTheEssence } from './core/elementalist/spells/peer-into-the-essence';
import { confluxChosen } from './core/elementalist/destinies/conflux-chosen';
import { arcaneConduit } from './core/mage/minions/arcane-conduit';
import { rainbowElemental } from './core/elementalist/minions/rainbow-elemental';
import { quicksands } from './core/mage/spells/quicksands';
import { windShield } from './core/mage/spells/wind-shield';
import { twister } from './core/mage/spells/twister';
import { earthquake } from './core/mage/spells/earthquake';
import { seerOfTheDepths } from './core/mage/minions/seer-of-the-depths';
import { elementalAlchemy } from './core/elementalist/destinies/elemental-alchemy';
import { healingMystic } from './core/neutral/minions/healing-mystic';
import { saberspineTiger } from './core/neutral/minions/saberspine-tiger';
import { fireElemental } from './core/neutral/minions/fire-elemental';
import { waterElemental } from './core/neutral/minions/water-elemental';
import { airElemental } from './core/neutral/minions/air-elemental';
import { earthElemental } from './core/neutral/minions/earth-elemental';
import { primusFist } from './core/neutral/minions/primus-fist';
import { cartographer } from './core/neutral/minions/cartographer';
import { shardCrafter } from './core/elementalist/minions/shard-crafter';
import { prismInvocation } from './core/elementalist/destinies/prism-invocation';

export const coreSet: CardSet = {
  id: CARD_SETS.CORE,
  name: 'Core Set',
  cards: [
    erina,
    sample,
    carefulStudy,
    sample2,
    fireBolt,
    frostShock,
    wizardTutor,
    manaFueledGolem,
    apprenticeMagician,
    arcaneMaster,
    orbPonderer,
    gargoyle,
    cosmicAvatar,
    lightningStrike,
    fireMastery,
    fireBall,
    shootingStar,
    amplifyMagic,
    elementalWisdom,
    fireShard,
    waterShard,
    airShard,
    earthShard,
    elementalistPath,
    wheelOfTheElements,
    pyromancer,
    peerIntoTheEssence,
    confluxChosen,
    arcaneConduit,
    rainbowElemental,
    quicksands,
    windShield,
    twister,
    earthquake,
    seerOfTheDepths,
    elementalAlchemy,
    healingMystic,
    saberspineTiger,
    fireElemental,
    waterElemental,
    airElemental,
    earthElemental,
    primusFist,
    cartographer,
    shardCrafter,
    prismInvocation
  ]
};
