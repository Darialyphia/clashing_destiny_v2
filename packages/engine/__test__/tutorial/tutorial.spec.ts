import { describe, expect, it, vi } from 'vitest';
import type { Game } from '../../src/game/game';
import type { GameClient } from '../../src/client/client';
import type { SerializedInput } from '../../src/input/input-system';
import { Tutorial, type TutorialStep } from '../../src/tutorial/tutorial';

const input = { type: 'test' } as unknown as SerializedInput;

const client = {} as GameClient;

const createStep = (overrides: Partial<TutorialStep> = {}): TutorialStep => ({
  id: 'root',
  isRoot: true,
  textBoxes: [],
  validate: () => ({ status: 'success' }),
  next: () => null,
  ...overrides
});

describe('Tutorial', () => {
  it('records validation errors and clears them after a successful input', async () => {
    let shouldFail = true;
    const game = { dispatch: vi.fn() } as unknown as Game;
    const tutorial = new Tutorial(game, {
      root: createStep({
        validate: () =>
          shouldFail
            ? { status: 'error', errorMessage: 'Try again' }
            : { status: 'success' }
      })
    });

    await tutorial.initialize(client);
    await tutorial.dispatch(input);

    expect(tutorial.attemptCount).toBe(1);
    expect(tutorial.lastError).toBe('Try again');
    expect(game.dispatch).not.toHaveBeenCalled();

    shouldFail = false;
    await tutorial.dispatch(input);

    expect(tutorial.lastError).toBeNull();
    expect(game.dispatch).toHaveBeenCalledOnce();
    expect(tutorial.status).toBe('finished');
  });

  it('serializes async transitions', async () => {
    let releaseTransition!: () => void;
    const transition = new Promise<void>(resolve => {
      releaseTransition = resolve;
    });
    const game = { dispatch: vi.fn() } as unknown as Game;
    const tutorial = new Tutorial(game, {
      root: createStep({
        onSuccess: () => transition
      })
    });

    await tutorial.initialize(client);
    const firstDispatch = tutorial.dispatch(input);
    await Promise.resolve();
    const secondDispatch = tutorial.dispatch(input);

    expect(tutorial.attemptCount).toBe(1);
    expect(game.dispatch).toHaveBeenCalledOnce();

    releaseTransition();
    await Promise.all([firstDispatch, secondDispatch]);

    expect(tutorial.status).toBe('finished');
  });

  it('resets to an authored checkpoint', async () => {
    const reset = vi.fn();
    const game = { dispatch: vi.fn() } as unknown as Game;
    const tutorial = new Tutorial(game, { root: createStep() });

    await tutorial.initialize(client);
    tutorial.setCheckpoint(reset, 'opening');
    await tutorial.dispatch(input);
    await tutorial.resetToCheckpoint();

    expect(reset).toHaveBeenCalledOnce();
    expect(tutorial.currentStep.id).toBe('root');
    expect(tutorial.attemptCount).toBe(0);
    expect(tutorial.status).toBe('active');
    expect(tutorial.isFinished).toBe(false);
  });
});
