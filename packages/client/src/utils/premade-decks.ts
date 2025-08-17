import { firebrand } from '@game/engine/src/card/sets/core/artifacts/firebrand';
import { rustyBlade } from '@game/engine/src/card/sets/core/artifacts/rusty-blade';
import { cabalInitiate } from '@game/engine/src/card/sets/core/destinies/cabal-initiate';
import { fearlessLeader } from '@game/engine/src/card/sets/core/destinies/fearless-leader';
import { fireAffinity } from '@game/engine/src/card/sets/core/destinies/fire-affinity';
import { fireStudies } from '@game/engine/src/card/sets/core/destinies/fire-studies';
import { insight } from '@game/engine/src/card/sets/core/destinies/insight';
import { inspiredBySteel } from '@game/engine/src/card/sets/core/destinies/inspired-by-steel';
import { theHangedMan } from '@game/engine/src/card/sets/core/destinies/the-hangman';
import { courageousFootsoldier } from '@game/engine/src/card/sets/core/minions/courageous-footsoldier';
import { flagBearerOfFlame } from '@game/engine/src/card/sets/core/minions/flag-bearer-of-flame';
import { flamefistFighter } from '@game/engine/src/card/sets/core/minions/flamefirst-fighter';
import { friendlySlime } from '@game/engine/src/card/sets/core/minions/friendly-slime';
import { hotHeadedRecruit } from '@game/engine/src/card/sets/core/minions/hot-headed-recruit';
import { phoenix } from '@game/engine/src/card/sets/core/minions/phoenix';
import { pyromancer } from '@game/engine/src/card/sets/core/minions/pyromancer';
import { sunEmperor } from '@game/engine/src/card/sets/core/minions/sun-emperor';
import { fireBall } from '@game/engine/src/card/sets/core/spells/fire-ball';
import { fireBolt } from '@game/engine/src/card/sets/core/spells/fire-bolt';
import { innerFire } from '@game/engine/src/card/sets/core/spells/inner-fire';
import type { GameOptions } from '@game/engine/src/game/game';

export type PremadeDeck = {
  name: string;
  mainDeck: GameOptions['players'][number]['mainDeck'];
  destinyDeck: GameOptions['players'][number]['mainDeck'];
  hero: GameOptions['players'][number]['hero'];
};

export const premadeDecks: Array<PremadeDeck> = [
  {
    name: 'Knight Starter Deck',
    destinyDeck: {
      cards: [
        fireAffinity.id,
        inspiredBySteel.id,
        fireStudies.id,
        insight.id,
        fearlessLeader.id,
        cabalInitiate.id,
        theHangedMan.id
      ]
    },
    mainDeck: {
      cards: [
        fireBolt.id,
        fireBolt.id,
        fireBolt.id,

        fireBall.id,
        fireBall.id,

        innerFire.id,
        innerFire.id,
        innerFire.id,

        friendlySlime.id,
        friendlySlime.id,
        friendlySlime.id,

        pyromancer.id,
        pyromancer.id,
        pyromancer.id,

        flagBearerOfFlame.id,
        flagBearerOfFlame.id,
        flagBearerOfFlame.id,

        hotHeadedRecruit.id,
        hotHeadedRecruit.id,
        hotHeadedRecruit.id,

        flamefistFighter.id,
        flamefistFighter.id,
        flamefistFighter.id,

        courageousFootsoldier.id,
        courageousFootsoldier.id,
        courageousFootsoldier.id,

        firebrand.id,
        firebrand.id,

        rustyBlade.id,
        rustyBlade.id,
        rustyBlade.id,

        sunEmperor.id,
        sunEmperor.id,

        phoenix.id
      ]
    },

    hero: 'knight'
  }
];
