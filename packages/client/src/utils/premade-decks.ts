import { rustyBlade } from '@game/engine/src/card/sets/core/artifacts/rusty-blade';
import { unyieldingShield } from '@game/engine/src/card/sets/core/artifacts/unyielding-shield';
import { aidenLv1 } from '@game/engine/src/card/sets/core/heroes/aiden-lv1';
import { aidenLv2 } from '@game/engine/src/card/sets/core/heroes/aiden-lv2';
import { aidenLv3 } from '@game/engine/src/card/sets/core/heroes/aiden-lv3';
import { courageousFootsoldier } from '@game/engine/src/card/sets/core/minions/courageous-footsoldier';
import { flagBearerOfFlame } from '@game/engine/src/card/sets/core/minions/flag-bearer-of-flame';
import { flameJuggler } from '@game/engine/src/card/sets/core/minions/flame-juggler';
import { friendlySlime } from '@game/engine/src/card/sets/core/minions/friendlySlime';
import { hotHeadedRecruit } from '@game/engine/src/card/sets/core/minions/hot-headed-recruit';
import { pyreboundLancer } from '@game/engine/src/card/sets/core/minions/pyrebound-lancer';
import { sharpShooter } from '@game/engine/src/card/sets/core/minions/sharpshooter';
import { shieldMaiden } from '@game/engine/src/card/sets/core/minions/shield-maiden';
import { fatedOath } from '@game/engine/src/card/sets/core/spells/fated-oath';
import { fireBolt } from '@game/engine/src/card/sets/core/spells/fire-bolt';
import { gazeIntoTomorrow } from '@game/engine/src/card/sets/core/spells/gaze-into-tomorrow';
import { knightsInspiration } from '@game/engine/src/card/sets/core/spells/knights-inspiration';
import { reposition } from '@game/engine/src/card/sets/core/spells/reposition';
import { slimesToTheRescue } from '@game/engine/src/card/sets/core/spells/slimes-to-the-rescue';
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
        flameJuggler.id,

        sharpShooter.id,
        sharpShooter.id,
        sharpShooter.id,
        sharpShooter.id,

        friendlySlime.id,
        friendlySlime.id,
        friendlySlime.id,
        friendlySlime.id,

        slimesToTheRescue.id,
        slimesToTheRescue.id,
        slimesToTheRescue.id,
        slimesToTheRescue.id,

        pyreboundLancer.id,
        pyreboundLancer.id,
        pyreboundLancer.id,
        pyreboundLancer.id,

        reposition.id,
        reposition.id,
        reposition.id,
        reposition.id
      ]
    },
    destinyDeck: {
      cards: [
        aidenLv1.id,
        aidenLv2.id,
        aidenLv3.id,
        unyieldingShield.id,
        fatedOath.id
      ]
    }
  }
];
