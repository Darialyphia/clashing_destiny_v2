/// <reference lib="webworker" />

import { Game, type GameOptions } from '@game/engine/src/game/game';
import type { SerializedInput } from '@game/engine/src/input/input-system';
import { AISystem } from '@game/engine/src/ai/ai.system';
import { match } from 'ts-pattern';

type AIWorkerEvent =
  | {
      type: 'init';
      payload: {
        options: GameOptions;
        playerId: string;
      };
    }
  | { type: 'dispatch'; payload: { input: SerializedInput } };

let ai: AISystem;
self.addEventListener('message', ({ data }) => {
  const options = data as AIWorkerEvent;

  match(options)
    .with({ type: 'init' }, ({ payload }) => {
      const game = new Game({ ...payload.options, id: 'AI' });
      ai = new AISystem(game, payload.playerId, (nextAction: SerializedInput) =>
        self.postMessage(nextAction)
      );
      ai.initialize();
    })
    .with({ type: 'dispatch' }, async ({ payload }) => {
      ai.onUpdate(payload.input);
    })
    .exhaustive();
});
