import { rustyBlade } from '@game/engine/src/card/sets/core/artifacts/rusty-blade';
import { courageousFootsoldier } from '@game/engine/src/card/sets/core/minions/courageous-footsoldier';
import { flagBearerOfFlame } from '@game/engine/src/card/sets/core/minions/flag-bearer-of-flame';
import { flameJuggler } from '@game/engine/src/card/sets/core/minions/flame-juggler';
import { hotHeadedRecruit } from '@game/engine/src/card/sets/core/minions/hot-headed-recruit';
import { shieldMaiden } from '@game/engine/src/card/sets/core/minions/shield-maiden';
import { fireBolt } from '@game/engine/src/card/sets/core/spells/fire-bolt';
import { gazeIntoTomorrow } from '@game/engine/src/card/sets/core/spells/gaze-into-tomorrow';
import { knightsInspiration } from '@game/engine/src/card/sets/core/spells/knights-inspiration';
import type { GameOptions } from '@game/engine/src/game/game';

export type PremadeDeck = {
  name: string;
  mainDeck: GameOptions['players'][number]['mainDeck'];
  destinyDeck: GameOptions['players'][number]['mainDeck'];
};

export const premadeDecks: Array<PremadeDeck> = [
  {
    name: 'Aiden Starter',
    mainDeck: {
      cards: [
        courageousFootsoldier.id,
        courageousFootsoldier.id,
        courageousFootsoldier.id,
        courageousFootsoldier.id,

        fireBolt.id,
        fireBolt.id,
        fireBolt.id,
        fireBolt.id,

        rustyBlade.id,
        rustyBlade.id,
        rustyBlade.id,
        rustyBlade.id,

        flagBearerOfFlame.id,
        flagBearerOfFlame.id,
        flagBearerOfFlame.id,
        flagBearerOfFlame.id,

        shieldMaiden.id,
        shieldMaiden.id,
        shieldMaiden.id,
        shieldMaiden.id,

        knightsInspiration.id,
        knightsInspiration.id,
        knightsInspiration.id,
        knightsInspiration.id,

        hotHeadedRecruit.id,
        hotHeadedRecruit.id,
        hotHeadedRecruit.id,
        hotHeadedRecruit.id,

        gazeIntoTomorrow.id,
        gazeIntoTomorrow.id,
        gazeIntoTomorrow.id,
        gazeIntoTomorrow.id,

        flameJuggler.id,
        flameJuggler.id,
        flameJuggler.id,
        flameJuggler.id
      ]
    },
    destinyDeck: {
      cards: ['aiden-lv1']
    }
  }
];
