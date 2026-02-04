/// <reference lib="webworker" />

import { CARDS_DICTIONARY } from '@game/engine/src/card/sets';
import { Game, type GameOptions } from '@game/engine/src/game/game';
import type { SerializedInput } from '@game/engine/src/input/input-system';
import { match } from 'ts-pattern';

type SandboxWorkerEvent =
  | {
      type: 'init';
      payload: {
        options: Pick<GameOptions, 'players' | 'rngSeed' | 'history'>;
      };
    }
  | { type: 'dispatch'; payload: { input: SerializedInput } }
  | { type: 'debug' }
  | { type: 'rewind'; payload: { step: number } }
  | { type: 'playCard'; payload: { blueprintId: string; playerId: string } };

let game: Game;

// Message queue to ensure sequential processing of async operations
const messageQueue: SandboxWorkerEvent[] = [];
let isProcessing = false;

async function processMessage(options: SandboxWorkerEvent): Promise<void> {
  await match(options)
    .with({ type: 'debug' }, () => {
      console.log(game);
    })
    .with({ type: 'init' }, async ({ payload }) => {
      game = new Game({
        id: 'sandbox',
        rngSeed: payload.options.rngSeed,
        history: payload.options.history ?? [],
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
      void game.dispatch(payload.input);
    })
    .with({ type: 'rewind' }, async ({ payload }) => {
      if (!game) {
        console.warn('Game not initialized yet, cannot rewind');
        return;
      }
      const history = game.inputSystem.serialize().slice(0, payload.step);
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
}

async function processQueue(): Promise<void> {
  if (isProcessing) return;
  isProcessing = true;

  while (messageQueue.length > 0) {
    const message = messageQueue.shift()!;
    try {
      await processMessage(message);
    } catch (error) {
      console.error('[SandboxWorker] Error processing message:', error);
    }
  }

  isProcessing = false;
}

self.addEventListener('message', ({ data }) => {
  const options = data as SandboxWorkerEvent;
  console.groupCollapsed('[SandboxWorker] new message');
  console.log(options);
  console.groupEnd();

  messageQueue.push(options);
  void processQueue();
});

setInterval(() => {
  console.log('[SANDBOX WORKER] Heartbeat: alive and processing messages');
}, 5000);
