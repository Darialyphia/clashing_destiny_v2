// Runs tutorial missions in the engine only, without a browser: seconds instead of minutes.
// It has to live in packages/engine/__test__/ to run (vitest only includes that folder), see SKILL.md.
import { describe, expect, it } from 'vitest';
import { TutorialV2 } from '../src/tutorial/v2/tutorial';
import { missions } from '../../client/src/pages/missions/index';
import { GAME_PHASES, INTERACTION_STATES } from '../src/game/game.enums';
import type { SerializedInput } from '../src/input/input-system';

const waitUntil = async (
  label: string,
  predicate: () => boolean,
  timeout = 8000
) => {
  const start = Date.now();
  while (!predicate()) {
    if (Date.now() - start > timeout)
      throw new Error(`Timed out waiting for: ${label}`);
    await new Promise(r => setTimeout(r, 10));
  }
};

const startMission = async (missionId: string) => {
  const mission = missions.find(m => m.id === missionId)!;
  // just enough of the client for the mission scripts: update notifications and DOM selectors that find nothing
  const listeners = new Set<(s: unknown) => void>();
  const selector = Object.assign(() => ({ element: null }), { element: null });
  const fakeClient = {
    ui: {
      displayedElements: {} as Record<string, boolean>,
      highlightedElement: null,
      highlightedCard: null,
      DOMSelectors: new Proxy({}, { get: () => selector })
    },
    state: { entities: {}, players: [] },
    onUpdateCompleted(cb: (s: unknown) => void) {
      listeners.add(cb);
      return () => listeners.delete(cb);
    }
  };
  const tutorial = new TutorialV2({
    gameOptions: { ...mission.options.gameOptions, id: 'tutorial' } as any,
    steps: mission.options.steps as any,
    meta: {}
  });
  // mimic the client: notify update listeners after each snapshot, and enter the first text box of each step.
  // The other text boxes' onEnter only run when the player clicks Next, call them yourself if a step needs them.
  tutorial.onSnapshot(snapshot => {
    setTimeout(() => {
      for (const cb of [...listeners]) cb(snapshot);
    }, 5);
  });
  tutorial.onEnterStep(async ctx => {
    await (ctx.currentStep.textBoxes[0] as any)?.onEnter?.(ctx);
  });
  const errors: unknown[] = [];
  await tutorial.initialize(fakeClient as any);
  tutorial.ctx.game.on('game.error' as any, (e: any) =>
    errors.push(e.data.error)
  );
  await tutorial.start();

  const game = () => tutorial.ctx.game;
  const p1 = () => game().playerSystem.player1;
  const step = () => tutorial.currentStep.id;
  return {
    tutorial,
    errors,
    game,
    p1,
    p2: () => game().playerSystem.player2,
    meta: () => tutorial.ctx.meta,
    step,
    // goes through the step's validation, like a player input
    dispatch: (input: SerializedInput) => tutorial.dispatch(input),
    waitForStep: (id: number) => waitUntil(`step ${id}`, () => step() === id),
    waitForState: (state: string) =>
      waitUntil(
        `interaction ${state}`,
        () => game().interaction.getState() === state
      ),
    waitForP1Turn: () =>
      waitUntil(
        'player 1 initiative',
        () =>
          game().turnSystem.initiativePlayer.equals(p1()) &&
          game().interaction.getState() === INTERACTION_STATES.IDLE &&
          game().gamePhaseSystem.getState() === GAME_PHASES.MAIN
      ),
    findInHand: (blueprintId: string) =>
      p1().cardManager.hand.find(c => c.blueprintId === blueprintId)!
  };
};

describe('tutorial missions', () => {
  it.each(missions.map(m => m.id))(
    '%s starts on step 0 without errors',
    async id => {
      const m = await startMission(id);
      await m.waitForP1Turn();
      expect(m.step()).toBe(0);
      expect(m.errors).toEqual([]);
    }
  );

  // example of a scripted step, copy and adapt it for the mission you are working on
  it('artifacts-secrets: step 0 is solved by supplying an adept and playing the templar on the shaman', async () => {
    const m = await startMission('artifacts-secrets');
    await m.waitForP1Turn();
    const templar = m.findInHand('tutorial-sunstone-templar');
    // the step wants a supplied card first
    expect(
      m.dispatch({
        type: 'declarePlayCard',
        payload: { playerId: 'p1', id: templar.id }
      }).isValid
    ).toBe(false);

    m.dispatch({
      type: 'declarePlayCard',
      payload: {
        playerId: 'p1',
        id: m.findInHand('tutorial-windblade-adept').id
      }
    });
    await waitUntil(
      'play card phase',
      () => m.game().gamePhaseSystem.getState() === GAME_PHASES.PLAY_CARD
    );
    m.dispatch({ type: 'supplyCard', payload: { playerId: 'p1' } });
    await m.waitForP1Turn();
    expect(m.p1().mana).toBe(2);

    m.dispatch({
      type: 'declarePlayCard',
      payload: { playerId: 'p1', id: templar.id }
    });
    await m.waitForState(INTERACTION_STATES.SELECTING_SPACE_ON_BOARD);
    m.dispatch({
      type: 'selectSpaceOnBoard',
      payload: { playerId: 'p1', id: m.p1().boardSide.base[0].id }
    });
    await m.waitForState(INTERACTION_STATES.SELECTING_CARDS_ON_BOARD);
    expect(
      m.dispatch({
        type: 'selectCardOnBoard',
        payload: { playerId: 'p1', cardId: m.meta().shaman.id }
      })
    ).toEqual({ isValid: true });
    await m.waitForStep(1);
    expect(m.meta().shaman.isOnBoard).toBe(false);
    expect(m.errors).toEqual([]);
  });
});
