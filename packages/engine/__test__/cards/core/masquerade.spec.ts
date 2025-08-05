// eslint-disable-next-line import/named
import { afterEach, describe, expect, test } from 'vitest';
import { CARDS_DICTIONARY } from '../../../src/card/sets';
import { testGameBuilder } from '../../test-utils';
import { knight } from '../../../src/card/sets/core/heroes/knight';
import { friendlySlime } from '../../../src/card/sets/core/minions/friendly-slime';
import { insight } from '../../../src/card/sets/core/destinies/insight';
import { fireAffinity } from '../../../src/card/sets/core/destinies/fire-affinity';
import { courageousFootsoldier } from '../../../src/card/sets/core/minions/courageous-footsoldier';
import { MinionCard } from '../../../src/card/entities/minion.entity';
import { hotHeadedRecruit } from '../../../src/card/sets/core/minions/hot-headed-recruit';
import { masquerade as masqueradeBlueprint } from '../../../src/card/sets/core/spells/masquerade';
import type { SpellCard } from '../../../src/card/entities/spell.entity';
import type { Game } from '../../../src';

describe('Card:Core:Masquerade', () => {
  const cleanup: { game?: Game } = {};

  afterEach(() => {
    if (cleanup.game) {
      cleanup.game.shutdown();
      cleanup.game = undefined;
    }
  });

  const setup = async () => {
    const cardPool = CARDS_DICTIONARY;
    const builder = testGameBuilder()
      .withOverrides({ cardPool })
      .withP1Deck({
        main: Array.from({ length: 40 }, () => friendlySlime.id),
        destiny: [insight.id, fireAffinity.id],
        hero: knight.id
      })
      .withP2Deck({
        main: Array.from({ length: 40 }, () => friendlySlime.id),
        destiny: [insight.id, fireAffinity.id],
        hero: knight.id
      });

    const game = await builder.build();

    cleanup.game = game.game;

    return {
      ...game,
      cardPool
    };
  };

  test('Should be playable when a minion gets attacked while having a cheaper minion in destiny', async () => {
    const { player1, player2, game, helpers } = await setup();
    await helpers.skipDestiny();

    const recruit = await helpers.generateAndPlayCard<MinionCard>(
      player1,
      courageousFootsoldier.id,
      [0, 1],
      { zone: 'attack', slot: 0 }
    );

    const masquerade = await player1.generateCard<SpellCard>(masqueradeBlueprint.id);
    player1.cardManager.addToHand(masquerade);

    await helpers.endTurn(player1);
    await helpers.waitUntilDestinyPhase();
    await helpers.playDestinyCard(fireAffinity.id);

    const attacker = await helpers.generateAndPlayCard<MinionCard>(
      player2,
      hotHeadedRecruit.id,
      [0],
      { zone: 'attack', slot: 0 }
    );

    await helpers.declareAttack(attacker, recruit);
    await helpers.skipBlock();

    expect(masquerade.canPlay()).toBe(true);
  });
});
