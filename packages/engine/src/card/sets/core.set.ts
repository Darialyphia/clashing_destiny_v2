import type { CardSet } from '.';
import { CARD_SETS } from '../card.enums';
import { erinaLv1 } from './core/arcane/heroes/erina-lv1';
import { erinaLv2 } from './core/arcane/heroes/erina-lvl2';
import { erinaLv3 } from './core/arcane/heroes/erina-lvl3';
import { spiritOfArcane } from './core/arcane/heroes/spirit-of-arcane';
import { archsageOfMoonring } from './core/arcane/minions/archsage-of-moonring';
import { astralExplorer } from './core/arcane/minions/astral-explorer';
import { astralSoldier } from './core/arcane/minions/astral-soldier';
import { cosmicAvatar } from './core/arcane/minions/cosmic-avatar';
import { cosmicDivinator } from './core/arcane/minions/cosmic-divinator';
import { littleWitch } from './core/arcane/minions/little-witch';
import { magicChanneler } from './core/arcane/minions/magic-channeler';
import { manaFueledGolem } from './core/arcane/minions/mana-fueled-golem';
import { manaLooter } from './core/arcane/minions/mana-looter';
import { amplifyMagic } from './core/arcane/spells/amplify-magic';
import { comet } from './core/arcane/spells/comet';
import { lightningBolt } from './core/arcane/spells/lightning-bolt';
import { magicMissile } from './core/arcane/spells/magic-missile';
import { splittingBeam } from './core/arcane/spells/splitting-beam';
import { thirstForKnowledge } from './core/arcane/spells/thirst-for-knowledge';
import { wizardsInsight } from './core/arcane/spells/wizards-insight';
import { wingOfSimurgh } from './core/arcane/spells/wing-of-simurgh';
import { tailOfSimurgh } from './core/arcane/spells/tail-of-simurgh';
import { sigilOfWisdom } from './core/arcane/sigils/sigil-of-wisdom';
import { galacticExplosion } from './core/arcane/spells/galactic-explosion';
import { powerOverwhelming } from './core/arcane/spells/power-overwhelming';
import { arcaneConduit } from './core/arcane/minions/arcane-conduit';
import { manaShield } from './core/arcane/spells/mana-shield';
import { timeBomb } from './core/arcane/sigils/time-bomb';
import { spellbladeDuelist } from './core/arcane/minions/spellblade-duelist';
import { manaWisp } from './core/neutral/minions/mana-wisp';
import { quirkyBookworm } from './core/arcane/minions/quirky-bookworm';
import { orbOfConstellations } from './core/arcane/artifacts/orb-of-constellations';
import { manaSpark } from './core/neutral/spells/mana-spark';
import { simurgh } from './core/arcane/minions/simurgh';
import { sigilOfSimurgh } from './core/arcane/sigils/sigil-of-simurgh';
import { jeweller } from './core/arcane/minions/jeweller';
import { plottingCounsellor } from './core/arcane/minions/plotting-counsellor';
import { replenishEnergy } from './core/arcane/spells/replenish-energy';
import { frostNova } from './core/arcane/spells/frost-nova';
import { rayOfFrost } from './core/arcane/spells/ray-of-frost';
import { bookOfKnowledge } from './core/arcane/artifacts/book-of-knowledge';
import { starseeker } from './core/arcane/minions/starseeker';
import { impromptuChallenger } from './core/order/minions/impromptu-challenger';
import { devotedNurse } from './core/order/minions/devoted-nurse';
import { braveCitizen } from './core/order/minions/brave-citizen';
import { royalGuard } from './core/order/minions/royal-guard';
import { duskPurifier } from './core/order/minions/dusk-purifier';
import { exaltedAngel } from './core/order/minions/exalted-angel';
import { promisingRecruit } from './core/neutral/minions/promising-recruit';
import { blowOfJudgment } from './core/order/spells/blow-of-judgment';
import { callToHeaven } from './core/order/spells/call-to-heaven';
import { rebuke } from './core/order/spells/rebuke';
import { angelWings } from './core/order/spells/angel-wings';
import { protectTheHolySpire } from './core/order/spells/protect-the-holy-spire';
import { wanderingPaladin } from './core/order/minions/wandering-paladin';
import { haroldLv1 } from './core/order/heroes/harold-lv1';
import { stalwartVanguard } from './core/order/minions/stalwart-vanguard';
import { haroldLv2 } from './core/order/heroes/harold-lv2';
import { haroldLv3 } from './core/order/heroes/harold-lv3';
import { spiritOfOrder } from './core/order/heroes/spirit-of-order';
import { mercyOfDawn } from './core/order/artifacts/mercy-of-dawn';
import { secondWings } from './core/order/minions/second-wings';
import { honorableCrown } from './core/order/artifacts/honorable-crown';
import { swordOfTruth } from './core/order/artifacts/sword-of-truth';
import { frontlineSkirmisher } from './core/order/minions/frontline-skirmisher';
import { dawnAssault } from './core/order/spells/dawn-assault';
import { reviseTheStrategy } from './core/neutral/spells/revise-the-strategy';
import { amuletOfRemembrance } from './core/neutral/artifacts/amulet-of-remembrance';
import { belovedMentor } from './core/neutral/minions/beloved-mentor';
import { whiteLion } from './core/order/minions/white-lion';
import { blitzTactics } from './core/order/spells/blitz-tactics';
import { firstWings } from './core/order/minions/first-wings';
import { littleAngel } from './core/order/minions/little-angel';

export const coreSet: CardSet = {
  id: CARD_SETS.CORE,
  name: 'Core Set',
  cards: [
    manaSpark,
    spiritOfArcane,
    erinaLv1,
    erinaLv2,
    erinaLv3,
    splittingBeam,
    wingOfSimurgh,
    tailOfSimurgh,
    archsageOfMoonring,
    manaLooter,
    magicChanneler,
    astralExplorer,
    cosmicDivinator,
    manaFueledGolem,
    amplifyMagic,
    thirstForKnowledge,
    littleWitch,
    comet,
    astralSoldier,
    magicMissile,
    wizardsInsight,
    lightningBolt,
    powerOverwhelming,
    galacticExplosion,
    arcaneConduit,
    sigilOfWisdom,
    manaShield,
    timeBomb,
    spellbladeDuelist,
    manaWisp,
    quirkyBookworm,
    orbOfConstellations,
    simurgh,
    sigilOfSimurgh,
    jeweller,
    plottingCounsellor,
    replenishEnergy,
    frostNova,
    rayOfFrost,
    bookOfKnowledge,
    starseeker,
    cosmicAvatar,
    impromptuChallenger,
    devotedNurse,
    braveCitizen,
    royalGuard,
    duskPurifier,
    exaltedAngel,
    promisingRecruit,
    blowOfJudgment,
    callToHeaven,
    rebuke,
    angelWings,
    protectTheHolySpire,
    wanderingPaladin,
    stalwartVanguard,
    haroldLv1,
    haroldLv2,
    haroldLv3,
    spiritOfOrder,
    mercyOfDawn,
    secondWings,
    honorableCrown,
    swordOfTruth,
    frontlineSkirmisher,
    dawnAssault,
    reviseTheStrategy,
    amuletOfRemembrance,
    belovedMentor,
    whiteLion,
    blitzTactics,
    firstWings,
    littleAngel
  ]
};
