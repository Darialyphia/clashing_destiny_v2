import type { CardSet } from '.';
import { CARD_SETS } from '../card.enums';
import { amuletOfRemembrance } from './core/artifacts/amulet-of-remembrance';
import { manaJewel } from './core/artifacts/mana-jewel';
import { rustyBlade } from './core/artifacts/rusty-blade';
import { scalesOfDestiny } from './core/artifacts/scales-of-destiny';
import { unyieldingShield } from './core/artifacts/unyielding-shield';
import { aidenLv1 } from './core/heroes/aiden-lv1';
import { aidenLv2 } from './core/heroes/aiden-lv2';
import { aidenLv3 } from './core/heroes/aiden-lv3';
import { erinaLv3 } from './core/heroes/erina-lv3';
import { noviceLv0 } from './core/heroes/novice-lv0';
import { angelOfRetribution } from './core/minions/angel-of-retribution';
import { bastionGuard } from './core/minions/bastion-guard';
import { courageousFootsoldier } from './core/minions/courageous-footsoldier';
import { flagBearerOfFlame } from './core/minions/flag-bearer-of-flame';
import { flameJuggler } from './core/minions/flame-juggler';
import { friendlySlime } from './core/minions/friendlySlime';
import { HolyCrusader } from './core/minions/holy-crusader';
import { hotHeadedRecruit } from './core/minions/hot-headed-recruit';
import { hougenThePunisher } from './core/minions/hougen-the-punisher';
import { manaWisp } from './core/minions/mana-wisp';
import { phoenix } from './core/minions/phoenix';
import { pyreboundLancer } from './core/minions/pyrebound-lancer';
import { radiantCelestial } from './core/minions/radiant-celestial';
import { royalGuard } from './core/minions/royal-guard';
import { sharpShooter } from './core/minions/sharpshooter';
import { shieldMaiden } from './core/minions/shield-maiden';
import { stalwartVanguard } from './core/minions/stalwart-vanguard';
import { sigilOfImmortalFlame } from './core/sigils/sigil-of-immortal-flame';
import { blindingLight } from './core/spells/blinding-light';
import { fatedOath } from './core/spells/fated-oath';
import { fireBolt } from './core/spells/fire-bolt';
import { fireball } from './core/spells/fireball';
import { flamingFrenzy } from './core/spells/flaming-frenzy';
import { gazeIntoTomorrow } from './core/spells/gaze-into-tomorrow';
import { grandCross } from './core/spells/grand-cross';
import { ironWall } from './core/spells/iron-wall';
import { knightsInspiration } from './core/spells/knights-inspiration';
import { manaSpark } from './core/spells/mana-spark';
import { reposition } from './core/spells/reposition';
import { slimesToTheRescue } from './core/spells/slimes-to-the-rescue';
import { sunburst } from './core/spells/sunburst';
import { arbitersMaul } from './core/artifacts/arbiters-maul';
import { innerfire } from './core/spells/inner-fire';
import { erinaLv1 } from './core/heroes/erina-lv1';
import { erinaLv2 } from './core/heroes/erina-lv2';
import { dualCasting } from './core/spells/dual-casting';
import { thirstForKnowledge } from './core/spells/thirst-for-knowledge';
import { arcaneRay } from './core/spells/arcane-ray';
import { arcaneConduit } from './core/minions/arcane-conduit';
import { shiftingCurrents } from './core/spells/shifting-currents';
import { archsageOfMoonring } from './core/minions/archsage-of-moonring';
import { magicInsight } from './core/spells/magic-insight';
import { fatedSeer } from './core/minions/fated-seer';
import { temporalRecollection } from './core/spells/temporal-recollection';
import { ceruleanWaveDisciple } from './core/minions/cerulean-wave-disciple';
import { navalaSurgingCatalyst } from './core/minions/navala-surging-catalyst';
import { sigilOfVoid } from './core/sigils/sigil-of-void';

export const coreSet: CardSet = {
  id: CARD_SETS.CORE,
  name: 'Core Set',
  cards: [
    arbitersMaul,
    fireBolt,
    noviceLv0,
    aidenLv1,
    aidenLv2,
    aidenLv3,
    courageousFootsoldier,
    hotHeadedRecruit,
    rustyBlade,
    knightsInspiration,
    shieldMaiden,
    gazeIntoTomorrow,
    flagBearerOfFlame,
    flameJuggler,
    sharpShooter,
    friendlySlime,
    slimesToTheRescue,
    pyreboundLancer,
    unyieldingShield,
    reposition,
    fatedOath,
    hougenThePunisher,
    amuletOfRemembrance,
    flamingFrenzy,
    grandCross,
    fireball,
    angelOfRetribution,
    phoenix,
    sigilOfImmortalFlame,
    erinaLv1,
    erinaLv2,
    erinaLv3,
    stalwartVanguard,
    ironWall,
    royalGuard,
    blindingLight,
    sunburst,
    radiantCelestial,
    manaSpark,
    manaJewel,
    scalesOfDestiny,
    manaWisp,
    bastionGuard,
    HolyCrusader,
    innerfire,
    dualCasting,
    thirstForKnowledge,
    arcaneRay,
    arcaneConduit,
    shiftingCurrents,
    archsageOfMoonring,
    magicInsight,
    fatedSeer,
    temporalRecollection,
    ceruleanWaveDisciple,
    navalaSurgingCatalyst,
    sigilOfVoid
  ]
};
