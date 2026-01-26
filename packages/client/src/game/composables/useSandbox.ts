import type { NetworkAdapter } from '@game/engine/src/client/client';
import { type GameOptions } from '@game/engine/src/game/game';
import { provideGameClient } from './useGameClient';
import { useFxAdapter } from './useFxAdapter';
import SandboxWorker from '../sandbox-worker?worker';

export const useSandbox = (
  options: Pick<GameOptions, 'players' | 'rngSeed'>
) => {
  const worker = { instance: new SandboxWorker() };
  const setupWorker = (history: GameOptions['history']) => {
    worker.instance.onerror = event => {
      console.error('Sandbox worker error:', event.message);
    };
    worker.instance.onmessageerror = event => {
      console.error('Sandbox worker message error:', event);
    };

    worker.instance.postMessage({
      type: 'init',
      payload: {
        options: JSON.parse(JSON.stringify({ ...options, history }))
      }
    });

    worker.instance.addEventListener('message', async event => {
      if (event.data.type === 'ready') {
        await client.value.initialize(
          event.data.payload.snapshot,
          event.data.payload.history
        );
        playerId.value = client.value.getActivePlayerId();
      }
    });
  };
  setupWorker([]);

  // @ts-expect-error
  window.__debugClient = () => {
    console.log(client.value);
  };
  // @ts-expect-error
  window.__debugGame = () => {
    worker.instance.postMessage({ type: 'debug' });
  };
  // @ts-expect-error
  window.__restartSandbox = () => {
    worker.instance.terminate();
    worker.instance = new SandboxWorker();
    setupWorker(client.value.history);
  };
  const autoSwitchPlayer = ref(true);

  const networkAdapter: NetworkAdapter = {
    dispatch: input => {
      // helper to detect input serialization issues when sending to the worker
      try {
        JSON.stringify(input);
      } catch {
        console.error('Input is not serializable', input);
      }
      worker.instance.postMessage({
        type: 'dispatch',
        payload: { input: JSON.parse(JSON.stringify(input)) }
      });
    },
    subscribe(cb) {
      worker.instance.addEventListener('message', event => {
        if (event.data.type === 'update') {
          cb(event.data.payload);
        }
      });
    },
    sync(lastSnapshotId) {
      console.log('TODO: sync snapshots from sandbox worker', lastSnapshotId);
      return Promise.resolve([]);
    }
  };

  const fxAdapter = useFxAdapter();

  const { client, playerId } = provideGameClient({
    networkAdapter,
    fxAdapter,
    gameType: 'local',
    playerId: 'p1',
    isSpectator: false
  });

  client.value.onUpdateCompleted(() => {
    if (autoSwitchPlayer.value) {
      playerId.value = client.value.getActivePlayerId();
    }
  });

  const rewindTo = (step: number) => {
    worker.instance.postMessage({ type: 'rewind', payload: { step } });
  };
  return {
    client,
    playerId,
    autoSwitchPlayer,
    rewindOneStep: () => rewindTo(client.value.history.length - 2),
    rewindTo,
    restart: () => rewindTo(0),
    playCard(blueprintId: string) {
      worker.instance.postMessage({
        type: 'playCard',
        payload: { blueprintId, playerId: client.value.getActivePlayerId() }
      });
    }
  };
};
