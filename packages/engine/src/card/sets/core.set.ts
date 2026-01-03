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
import { sigilOfWisdom } from './core/arcane/sigils/sigil-of-wisdom';
import { galacticExplosion } from './core/arcane/spells/galactic-explosion';
import { powerOverwhelming } from './core/arcane/spells/power-overwhelming';
import { arcaneConduit } from './core/arcane/minions/arcane-conduit';
import { manaShield } from './core/arcane/spells/mana-shield';
import { timeBomb } from './core/arcane/sigils/time-bomb';
import { spellbladeDuelist } from './core/arcane/minions/spellblade-duelist';
import { manaWisp } from './core/neutral/minions/mana-wisp';
import { quirkyBookworm } from './core/arcane/minions/quirky-bookworm';
import { orbOfConstellations } from './core/arcane/artifact/orb-of-constellations';
import { manaSpark } from './core/neutral/spells/mana-spark';
import { simurgh } from './core/arcane/minions/simurgh';
import { sigilOfSimurgh } from './core/arcane/sigils/sigil-of-simurgh';
import { jeweller } from './core/arcane/minions/jeweller';
import { plottingCounsellor } from './core/arcane/minions/plotting-counsellor';
import { replenishEnergy } from './core/arcane/spells/replenish-energy';
import { frostNova } from './core/arcane/spells/frost-nova';
import { rayOfFrost } from './core/arcane/spells/ray-of-frost';
import { bookOfKnowledge } from './core/arcane/artifact/book-of-knowledge';
import { starseeker } from './core/arcane/minions/starseeker';

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
    cosmicAvatar
  ]
};
