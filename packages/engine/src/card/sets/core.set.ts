import type { CardSet } from '.';
import { CARD_SETS } from '../card.enums';
import { rustyBlade } from './core/artifacts/rusty-blade';
import { aidenLv1 } from './core/heroes/aiden-lv1';
import { aidenLv2 } from './core/heroes/aiden-lv2';
import { noviceLv0 } from './core/heroes/novice-lv0';
import { courageousFootsoldier } from './core/minions/courageous-footsoldier';
import { flagBearerOfFlame } from './core/minions/flag-bearer-of-flame';
import { flameJuggler } from './core/minions/flame-juggler';
import { friendlySlime } from './core/minions/friendlySlime';
import { hotHeadedRecruit } from './core/minions/hot-headed-recruit';
import { pyreboundLancer } from './core/minions/pyrebound-lancer';
import { sharpShooter } from './core/minions/sharpshooter';
import { shieldMaiden } from './core/minions/shield-maiden';
import { fireBolt } from './core/spells/fire-bolt';
import { gazeIntoTomorrow } from './core/spells/gaze-into-tomorrow';
import { knightsInspiration } from './core/spells/knights-inspiration';
import { slimesToTheRescue } from './core/spells/slimes-to-the-rescue';

export const coreSet: CardSet = {
  id: CARD_SETS.CORE,
  name: 'Core Set',
  cards: [
    fireBolt,
    noviceLv0,
    aidenLv1,
    aidenLv2,
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
    pyreboundLancer
  ]
};
