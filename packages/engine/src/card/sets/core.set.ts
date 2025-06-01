import type { CardSet } from '.';
import { CARD_SETS } from '../card.enums';
import { firebrand } from './core/artifacts/firebrand';
import { immortalFlame } from './core/artifacts/immortal-flame';
import { finalSlash } from './core/attacks/final-slash';
import { elementalist } from './core/heroes/elementalist';
import { mage } from './core/heroes/mage';
import { novice } from './core/heroes/novice';
import { sage } from './core/heroes/sage';
import { sorcerer } from './core/heroes/sorcerer';
import { warlock } from './core/heroes/warlock';
import { warrior } from './core/heroes/warrior';
import { archsageOfMoonring } from './core/minions/archsage-of-moonring';
import { blazingSalamander } from './core/minions/blazing-salamander';
import { flagBearerOfFlame } from './core/minions/flag-bearer-of-flame';
import { flamefistFighter } from './core/minions/flamefirst-fighter';
import { hotHeadedRecruit } from './core/minions/hot-headed-recruit';
import { magicChanneler } from './core/minions/magic-channeler';
import { magicFueledGolem } from './core/minions/magic-fueled-golem';
import { phoenix } from './core/minions/phoenix';
import { pyromancer } from './core/minions/pyromancer';
import { seer } from './core/minions/seer';
import { spellbladeDuelist } from './core/minions/spellblade-duelist';
import { arcaneInsight } from './core/spells/arcane-insight';
import { channelTheFlames } from './core/spells/channel-the-flames';
import { dualCasting } from './core/spells/dual-casting';
import { fireBall } from './core/spells/fire-ball';
import { fireBolt } from './core/spells/fire-bolt';
import { ignite } from './core/spells/ignite';
import { innerFire } from './core/spells/inner-fire';
import { pyroclasm } from './core/spells/pyroclasm';
import { scorchedEarth } from './core/spells/scorched-earth';
import { thirstForKnowledge } from './core/spells/thirst-for-knowledge';
import { fireStudies } from './core/talents/fire-studies';

export const coreSet: CardSet = {
  id: CARD_SETS.CORE,
  name: 'Core Set',
  cards: [
    novice,

    // Mage Lineage
    mage,
    elementalist,
    sage,
    sorcerer,
    warlock,

    // Warrior Lineage
    warrior,

    // Fire
    fireBolt,
    fireBall,
    ignite,
    scorchedEarth,
    flamefistFighter,
    pyromancer,
    blazingSalamander,
    phoenix,
    flagBearerOfFlame,
    immortalFlame,
    hotHeadedRecruit,
    finalSlash,
    fireStudies,
    channelTheFlames,
    firebrand,
    pyroclasm,
    innerFire,

    // Arcane,
    dualCasting,
    arcaneInsight,
    thirstForKnowledge,
    magicChanneler,
    archsageOfMoonring,
    seer,
    magicFueledGolem,
    spellbladeDuelist
  ]
};
