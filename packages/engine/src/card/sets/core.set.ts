import type { CardSet } from '.';
import { CARD_SETS } from '../card.enums';
import { firebrand } from './core/artifacts/firebrand';
import { immortalFlame } from './core/artifacts/immortal-flame';
import { rustyBlade } from './core/artifacts/rusty-blade';
import { knight } from './core/heroes/knight';
import { sage } from './core/heroes/sage';
import { sorcerer } from './core/heroes/sorcerer';
import { warlock } from './core/heroes/warlock';
import { archsageOfMoonring } from './core/minions/archsage-of-moonring';
import { ardentMonk } from './core/minions/ardent-monk';
import { blazingSalamander } from './core/minions/blazing-salamander';
import { courageousFootsoldier } from './core/minions/courageous-footsoldier';
import { enjiOneManArmy } from './core/minions/enji-one-man-army';
import { esteemedErudite } from './core/minions/esteemed-erudite';
import { flagBearerOfFlame } from './core/minions/flag-bearer-of-flame';
import { flameExorcist } from './core/minions/flame-exorcist';
import { flamefistFighter } from './core/minions/flamefirst-fighter';
import { friendlySlime } from './core/minions/friendly-slime';
import { hotHeadedRecruit } from './core/minions/hot-headed-recruit';
import { magicChanneler } from './core/minions/magic-channeler';
import { magicFueledGolem } from './core/minions/magic-fueled-golem';
import { phoenix } from './core/minions/phoenix';
import { pyreArchfiend } from './core/minions/pyre-archfiend';
import { pyromancer } from './core/minions/pyromancer';
import { seer } from './core/minions/seer';
import { spellbladeDuelist } from './core/minions/spellblade-duelist';
import { temporalShifter } from './core/minions/temporal-shifter';
import { arcaneInsight } from './core/spells/arcane-insight';
import { channelTheFlames } from './core/spells/channel-the-flames';
import { dualCasting } from './core/spells/dual-casting';
import { fireBall } from './core/spells/fire-ball';
import { fireBolt } from './core/spells/fire-bolt';
import { forgedInTheCrater } from './core/spells/forged-in-the-crater';
import { hourglassFracture } from './core/spells/hourglass-fracture';
import { innerFire } from './core/spells/inner-fire';
import { novaBlast } from './core/spells/nova-blast';
import { pyroclasm } from './core/spells/pyroclasm';
import { recollection } from './core/spells/recollection';
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
    knight,

    // Normal
    courageousFootsoldier,
    friendlySlime,
    rustyBlade,

    // Fire
    fireBolt,
    fireBall,
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
    pyreArchfiend,
    enjiOneManArmy,
    flameExorcist,
    ardentMonk,
    forgedInTheCrater,

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
