import { afterEach, describe, expect, it } from 'vitest';
import type { MinionBlueprint } from '../../src/card/card-blueprint';
import { defaultCardArt } from '../../src/card/card-utils';
import {
  AFFINITIES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES
} from '../../src/card/card.enums';
import { GAME_PHASES } from '../../src/game/game.enums';
import { TEST_PLAYER_IDS, TestSession } from './test-session';

const testMinion: MinionBlueprint = {
  id: 'test-session-minion',
  name: 'Test Session Minion',
  description: 'A test minion.',
  collectable: false,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('minions/test-session-minion'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.COMMON,
  affinities: [AFFINITIES.NEUTRAL],
  manaCost: 1,
  manaSupply: 0,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 1,
  maxHp: 1,
  commandment: 0,
  canPlay: () => true,
  abilities: [],
  async onInit() {},
  async onPlay() {},
  aiHints: {
    shouldPlay: () => 1,
    shouldAttack: () => 1,
    shouldMove: () => 1,
    getThreatScore: () => 1
  }
};

describe('TestSession', () => {
  const sessions: TestSession[] = [];

  afterEach(() => {
    for (const session of sessions.splice(0)) session.shutdown();
  });

  it('builds a game with custom blueprints, fixtures, inputs, and full snapshots', async () => {
    const session = await TestSession.builder().withBlueprints(testMinion).build();
    sessions.push(session);

    const initialSnapshot = await session.waitForSnapshot(
      snapshot =>
        snapshot.kind === 'state' && snapshot.state.phase.state === GAME_PHASES.MAIN
    );
    const minion = await session.addMinionToBoard(
      TEST_PLAYER_IDS.player1,
      testMinion.id,
      'base',
      0
    );
    const nextSnapshot = session.waitForSnapshot(
      snapshot => snapshot.id > initialSnapshot.id
    );

    await session.move(TEST_PLAYER_IDS.player1, minion.id, 'base', 1);

    await expect(nextSnapshot).resolves.toMatchObject({ kind: 'state' });
    expect(minion.position).toBe(
      session.getBoardSpace(TEST_PLAYER_IDS.player1, 'base', 1)
    );
    expect(session.getCardsInPlay(TEST_PLAYER_IDS.player1)).toContain(minion);
  });

  it('returns unsubscribe callbacks for full and diff snapshot subscriptions', async () => {
    const session = await TestSession.builder().withBlueprints(testMinion).build();
    sessions.push(session);
    const fullSnapshots: number[] = [];
    const diffSnapshots: number[] = [];
    const stopFull = session.game.subscribeOmniscientState(snapshot =>
      fullSnapshots.push(snapshot.id)
    );
    const stopDiff = session.game.subscribeOmniscient(snapshot =>
      diffSnapshots.push(snapshot.id)
    );

    await session.addMinionToBoard(TEST_PLAYER_IDS.player1, testMinion.id, 'base', 0);
    await session.game.snapshotSystem.takeSnapshot();
    stopFull();
    stopDiff();

    await session.addMinionToBoard(TEST_PLAYER_IDS.player1, testMinion.id, 'base', 1);
    await session.game.snapshotSystem.takeSnapshot();

    expect(fullSnapshots).toHaveLength(1);
    expect(diffSnapshots).toHaveLength(1);
  });
});
