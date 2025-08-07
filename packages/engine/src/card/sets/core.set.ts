import type { CardSet } from '.';
import { CARD_SETS } from '../card.enums';
import { firebrand } from './core/artifacts/firebrand';
import { orbOfTheTides } from './core/artifacts/orb-of-the-tides';
import { rainbowCeremonialSword } from './core/artifacts/rainbow-sword';
import { runedShiv } from './core/artifacts/runed-shiv';
import { rustyBlade } from './core/artifacts/rusty-blade';
import { tomeOfKnowledge } from './core/artifacts/tome-of-knowledge';
import { arcaneAffinity } from './core/destinies/arcane-affinity';
import { arcaneMastery } from './core/destinies/arcane-mastery';
import { bloodAffinity } from './core/destinies/blood-affinity';
import { bloodCovenant } from './core/destinies/blood-covenant';
import { cabalInitiate } from './core/destinies/cabal-initiate';
import { chronoAffinity } from './core/destinies/chrono-affinity';
import { fearlessLeader } from './core/destinies/fearless-leader';
import { fireAffinity } from './core/destinies/fire-affinity';
import { fireStudies } from './core/destinies/fire-studies';
import { insight } from './core/destinies/insight';
import { inspiredBySteel } from './core/destinies/inspired-by-steel';
import { manaVisions } from './core/destinies/mana-visions';
import { theHangedMan } from './core/destinies/the-hangman';
import { tidesFavored } from './core/destinies/tides-favored';
import { waterAffinity } from './core/destinies/water-affinity';
import { knight } from './core/heroes/knight';
import { sage } from './core/heroes/sage';
import { archsageOfMoonring } from './core/minions/archsage-of-moonring';
import { ardentMonk } from './core/minions/ardent-monk';
import { battleflameInvoker } from './core/minions/battleflame-invoker';
import { blazingSalamander } from './core/minions/blazing-salamander';
import { ceruleanWaveDisciple } from './core/minions/cerulean-wave-disciple';
import { courageousFootsoldier } from './core/minions/courageous-footsoldier';
import { crimsonSuppressor } from './core/minions/crimson-suppressor';
import { enjiOneManArmy } from './core/minions/enji-one-man-army';
import { esteemedErudite } from './core/minions/esteemed-erudite';
import { flagBearerOfFlame } from './core/minions/flag-bearer-of-flame';
import { flameExorcist } from './core/minions/flame-exorcist';
import { flamefistFighter } from './core/minions/flamefirst-fighter';
import { flowkeeperSage } from './core/minions/flowkeeper-sage';
import { friendlySlime } from './core/minions/friendly-slime';
import { heraldOfSalvation } from './core/minions/herald-of-salvation';
import { hotHeadedRecruit } from './core/minions/hot-headed-recruit';
import { luminescentMystic } from './core/minions/luminescent-mystic';
import { magicChanneler } from './core/minions/magic-channeler';
import { magicFueledGolem } from './core/minions/magic-fueled-golem';
import { nagaSkirmisher } from './core/minions/naga-skirmisher';
import { phoenix } from './core/minions/phoenix';
import { playfulEels } from './core/minions/playful-eels';
import { poseidonEmperorOfTheSea } from './core/minions/poseidon-emperor-of-the-sea';
import { pyreArchfiend } from './core/minions/pyre-archfiend';
import { pyreboundLancer } from './core/minions/pyrebound-lancer';
import { pyromancer } from './core/minions/pyromancer';
import { seer } from './core/minions/seer';
import { spellbladeDuelist } from './core/minions/spellblade-duelist';
import { spiritualist } from './core/minions/spiritualist';
import { stalwartVanguard } from './core/minions/stalwart-vanguard';
import { sunEmperor } from './core/minions/sun-emperor';
import { sunPalaceGuard } from './core/minions/sun-palace-guard';
import { temporalShifter } from './core/minions/temporal-shifter';
import { waterElemental } from './core/minions/water-elemental';
import { arcaneInsight } from './core/spells/arcane-insight';
import { calmWaters } from './core/spells/calm-waters';
import { channelTheFlames } from './core/spells/channel-the-flames';
import { dualCasting } from './core/spells/dual-casting';
import { fireBall } from './core/spells/fire-ball';
import { fireBolt } from './core/spells/fire-bolt';
import { forgedInTheCrater } from './core/spells/forged-in-the-crater';
import { gazeIntoTomorrow } from './core/spells/gaze-into-tomorrow';
import { hourglassFracture } from './core/spells/hourglass-fracture';
import { innerFire } from './core/spells/inner-fire';
import { manaShield } from './core/spells/mana-shield';
import { masquerade } from './core/spells/masquerade';
import { moltenShield } from './core/spells/molten-shield';
import { novaBlast } from './core/spells/nova-blast';
import { powerOverwhelming } from './core/spells/power-overwhelming';
import { pyroclasm } from './core/spells/pyroclasm';
import { recollection } from './core/spells/recollection';
import { revisedStrategy } from './core/spells/revised-strategy';
import { shiftingCurrents } from './core/spells/shifting-currents';
import { shoalOfEels } from './core/spells/shoal-of-eels';
import { slipstreamVeil } from './core/spells/slipstream-veil';
import { surgeOfWill } from './core/spells/surge-of-will';
import { thirstForKnowledge } from './core/spells/thirst-for-knowledge';
import { tidalWave } from './core/spells/tidal-wave';
import { tranquility } from './core/spells/tranquility';
import { waterSpringLily } from './core/spells/water-spring-lily';

export const coreSet: CardSet = {
  id: CARD_SETS.CORE,
  name: 'Core Set',
  cards: [
    // Heroes
    sage,
    // sorcerer,
    // warlock,
    knight,

    // Normal
    fireAffinity,
    waterAffinity,
    arcaneAffinity,
    chronoAffinity,
    bloodAffinity,
    courageousFootsoldier,
    friendlySlime,
    rustyBlade,
    inspiredBySteel,
    insight,
    manaVisions,
    rainbowCeremonialSword,
    heraldOfSalvation,
    luminescentMystic,
    stalwartVanguard,
    sunEmperor,
    sunPalaceGuard,
    runedShiv,
    gazeIntoTomorrow,
    fearlessLeader,
    revisedStrategy,
    masquerade,
    spiritualist,
    tomeOfKnowledge,
    orbOfTheTides,
    cabalInitiate,
    theHangedMan,
    bloodCovenant,

    // Fire
    fireBolt,
    fireBall,
    flamefistFighter,
    pyromancer,
    blazingSalamander,
    phoenix,
    flagBearerOfFlame,
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
    fireStudies,
    pyreboundLancer,
    moltenShield,
    battleflameInvoker,

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
    arcaneMastery,
    manaShield,
    powerOverwhelming,

    // Chrono
    recollection,
    hourglassFracture,
    temporalShifter,

    // Water
    tidalWave,
    ceruleanWaveDisciple,
    waterSpringLily,
    flowkeeperSage,
    tranquility,
    slipstreamVeil,
    waterElemental,
    tidesFavored,
    playfulEels,
    nagaSkirmisher,
    shoalOfEels,
    shiftingCurrents,
    poseidonEmperorOfTheSea,
    calmWaters,

    // Blood
    crimsonSuppressor
  ]
};
