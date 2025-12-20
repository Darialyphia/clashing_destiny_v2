import type { CardSet } from '.';
import { CARD_SETS } from '../card.enums';
import { erinaLv1 } from './core/arcane/heroes/erina-lv1';
import { erinaLv2 } from './core/arcane/heroes/erina-lvl2';
import { erinaLv3 } from './core/arcane/heroes/erina-lvl3';
import { spiritOfArcane } from './core/arcane/heroes/spirit-of-arcane';
import { archsageOfMoonring } from './core/arcane/minions/archsage-of-moonring';
import { astralExplorer } from './core/arcane/minions/astral-explorer';
import { astralSoldier } from './core/arcane/minions/astral-soldier';
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
import { sigilOfWisdom } from './core/arcane/sigils/sigil-of-widom';
import { galacticExplosion } from './core/arcane/spells/galactic-explosion';
import { powerOverwhelming } from './core/arcane/spells/power-overwhelming';
import { arcaneConduit } from './core/arcane/minions/arcane-conduit';

export const coreSet: CardSet = {
  id: CARD_SETS.CORE,
  name: 'Core Set',
  cards: [
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
    sigilOfWisdom
  ]
};
