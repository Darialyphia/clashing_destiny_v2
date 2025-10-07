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
  | { type: 'dispatch'; payload: { input: SerializedInput } }
  | { type: 'debug' }
  | { type: 'rewind'; payload: { step: number } }
  | { type: 'playCard'; payload: { blueprintId: string; playerId: string } };

let game: Game;
self.addEventListener('message', ({ data }) => {
  const options = data as SandboxWorkerEvent;

  match(options)
    .with({ type: 'debug' }, () => {
      console.log(game);
    })
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

      await game.initialize();
      self.postMessage({
        type: 'ready',
        payload: {
          snapshot: game.snapshotSystem.getLatestOmniscientSnapshot()
        }
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
    })
    .with({ type: 'dispatch' }, async ({ payload }) => {
      game.dispatch(payload.input);
    })
    .with({ type: 'rewind' }, async ({ payload }) => {
      if (!game) {
        console.warn('Game not initialized yet, cannot rewind');
      }
      const history = game.inputSystem.serialize().slice(0, payload.step + 1);
      game = new Game({ ...game.options, history });

      await game.initialize();
      self.postMessage({
        type: 'ready',
        payload: {
          snapshot: game.snapshotSystem.getLatestOmniscientSnapshot(),
          history: game.inputSystem.serialize()
        }
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
    })
    .with({ type: 'playCard' }, async ({ payload }) => {
      const player = game.playerSystem.getPlayerById(payload.playerId)!;
      const card = await player.generateCard(payload.blueprintId);
      await card.play(() => {});
    })
    .exhaustive();
});
