import type { CardSet } from '.';
import { CARD_SETS } from '../card.enums';
import { rustyBlade } from './core/artifacts/rusty-blade';
import { aidenLv1 } from './core/heroes/aiden-lv1';
import { noviceLv0 } from './core/heroes/novice-lv0';
import { courageousFootsoldier } from './core/minions/courageous-footsoldier';
import { flagBearerOfFlame } from './core/minions/flag-bearer-of-flame';
import { flameJuggler } from './core/minions/flame-juggler';
import { hotHeadedRecruit } from './core/minions/hot-headed-recruit';
import { shieldMaiden } from './core/minions/shield-maiden';
import { fireBolt } from './core/spells/fire-bolt';
import { gazeIntoTomorrow } from './core/spells/gaze-into-tomorrow';
import { knightsInspiration } from './core/spells/knights-inspiration';

export const coreSet: CardSet = {
  id: CARD_SETS.CORE,
  name: 'Core Set',
  cards: [
    fireBolt,
    noviceLv0,
    aidenLv1,
    courageousFootsoldier,
    hotHeadedRecruit,
    rustyBlade,
    knightsInspiration,
    shieldMaiden,
    gazeIntoTomorrow,
    flagBearerOfFlame,
    flameJuggler
  ]
};
