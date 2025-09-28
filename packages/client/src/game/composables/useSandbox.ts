import type { NetworkAdapter } from '@game/engine/src/client/client';
import { type GameOptions } from '@game/engine/src/game/game';
import { provideGameClient } from './useGameClient';
import { useFxAdapter } from './useFxAdapter';
import SandboxWorker from '../sandbox-worker?worker';

export const useSandbox = (
  options: Pick<GameOptions, 'players' | 'rngSeed'>
) => {
  const worker = new SandboxWorker();
  const autoSwitchPlayer = ref(true);

  worker.postMessage({
    type: 'init',
    payload: {
      options: JSON.parse(JSON.stringify(options))
    }
  });

  // @ts-expect-error
  window.__debugClient = () => {
    console.log(client.value);
  };
  const networkAdapter: NetworkAdapter = {
    dispatch: input => {
      // helper to detect input serialization issues when sending to the worker
      try {
        JSON.stringify(input);
      } catch {
        console.error('Input is not serializable', input);
      }
      worker.postMessage({
        type: 'dispatch',
        payload: { input: JSON.parse(JSON.stringify(input)) }
      });
    },
    subscribe(cb) {
      worker.addEventListener('message', event => {
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
    playerId: 'p1'
  });

  client.value.onUpdateCompleted(() => {
    if (autoSwitchPlayer.value) {
      playerId.value = client.value.getActivePlayerId();
    }
  });

  worker.addEventListener('message', event => {
    if (event.data.type === 'ready') {
      client.value.initialize(event.data.payload.snapshot);
      playerId.value = client.value.getActivePlayerId();
    }
  });

  return { client, playerId, autoSwitchPlayer };
};
