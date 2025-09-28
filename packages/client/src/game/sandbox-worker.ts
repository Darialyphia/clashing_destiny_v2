/// <reference lib="webworker" />

import { CARDS_DICTIONARY } from '@game/engine/src/card/sets';
import { Game, type GameOptions } from '@game/engine/src/game/game';
import type { SerializedInput } from '@game/engine/src/input/input-system';
import { match } from 'ts-pattern';

type SandboxWorkerEvent =
  | {
      type: 'init';
      payload: {
        options: Pick<GameOptions, 'players' | 'rngSeed'>;
      };
    }
  | { type: 'dispatch'; payload: { input: SerializedInput } };

let game: Game;
self.addEventListener('message', ({ data }) => {
  const options = data as SandboxWorkerEvent;

  match(options)
    .with({ type: 'init' }, async ({ payload }) => {
      game = new Game({
        id: 'sandbox',
        rngSeed: payload.options.rngSeed,
        history: [],
        overrides: {
          cardPool: CARDS_DICTIONARY
        },
        players: payload.options.players
      });
      game.subscribeOmniscient(snapshot => {
        // helper to find malformed events that would break structuredClone
        snapshot.events.forEach(event => {
          try {
            JSON.stringify(event);
          } catch {
            console.error('Error stringifying event:', event.eventName, event);
          }
        });

        self.postMessage({
          type: 'update',
          payload: snapshot
        });
      });
      await game.initialize();
      self.postMessage({
        type: 'ready',
        payload: {
          snapshot: game.snapshotSystem.getLatestOmniscientSnapshot()
        }
      });
    })
    .with({ type: 'dispatch' }, async ({ payload }) => {
      game.dispatch(payload.input);
    })
    .exhaustive();
});
