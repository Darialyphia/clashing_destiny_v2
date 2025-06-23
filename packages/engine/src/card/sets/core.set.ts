import type { CardSet } from '.';
import { CARD_SETS } from '../card.enums';
import { firebrand } from './core/artifacts/firebrand';
import { immortalFlame } from './core/artifacts/immortal-flame';
import { sage } from './core/heroes/sage';
import { sorcerer } from './core/heroes/sorcerer';
import { warlock } from './core/heroes/warlock';
import { archsageOfMoonring } from './core/minions/archsage-of-moonring';
import { blazingSalamander } from './core/minions/blazing-salamander';
import { courageousFootsoldier } from './core/minions/courageous-footsoldier';
import { esteemedErudite } from './core/minions/esteemed-erudite';
import { flagBearerOfFlame } from './core/minions/flag-bearer-of-flame';
import { flamefistFighter } from './core/minions/flamefirst-fighter';
import { friendlySlime } from './core/minions/friendly-slime';
import { hotHeadedRecruit } from './core/minions/hot-headed-recruit';
import { magicChanneler } from './core/minions/magic-channeler';
import { magicFueledGolem } from './core/minions/magic-fueled-golem';
import { phoenix } from './core/minions/phoenix';
import { pyromancer } from './core/minions/pyromancer';
import { seer } from './core/minions/seer';
import { spellbladeDuelist } from './core/minions/spellblade-duelist';
import { temporalShifter } from './core/minions/temporal-shifter';
import { arcaneInsight } from './core/spells/arcane-insight';
import { channelTheFlames } from './core/spells/channel-the-flames';
import { dualCasting } from './core/spells/dual-casting';
import { fireBall } from './core/spells/fire-ball';
import { fireBolt } from './core/spells/fire-bolt';
import { hourglassFracture } from './core/spells/hourglass-fracture';
import { ignite } from './core/spells/ignite';
import { innerFire } from './core/spells/inner-fire';
import { novaBlast } from './core/spells/nova-blast';
import { pyroclasm } from './core/spells/pyroclasm';
import { recollection } from './core/spells/recollection';
import { scorchedEarth } from './core/spells/scorched-earth';
import { surgeOfWill } from './core/spells/surge-of-will';
import { thirstForKnowledge } from './core/spells/thirst-for-knowledge';

export const coreSet: CardSet = {
  id: CARD_SETS.CORE,
  name: 'Core Set',
  cards: [
    // Heroes
    sage,
    sorcerer,
    warlock,

    // Normal
    courageousFootsoldier,
    friendlySlime,

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
    spellbladeDuelist,
    novaBlast,
    esteemedErudite,
    surgeOfWill,

    // Chrono
    recollection,
    hourglassFracture,
    temporalShifter
  ]
};
