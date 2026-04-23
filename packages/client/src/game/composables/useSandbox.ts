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
  // @ts-expect-error
  window.__debugGame = () => {
    worker.postMessage({ type: 'debug' });
  };
  const networkAdapter: NetworkAdapter = {
    dispatch: input => {
      // helper to detect input serialization issues when sending to the worker (eg. sending an unserialized class instance that satisfies the interface and gives no type error)
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
    playerId: 'p1',
    isSpectator: false
  });

  client.value.onUpdateCompleted(() => {
    if (autoSwitchPlayer.value) {
      playerId.value = client.value.getActivePlayerId();
    }
  });

  worker.addEventListener('message', async event => {
    if (event.data.type === 'ready') {
      await client.value.initialize(
        event.data.payload.snapshot,
        event.data.payload.history
      );
      playerId.value = client.value.getActivePlayerId();
    }
  });

  const rewindTo = (step: number) => {
    worker.postMessage({ type: 'rewind', payload: { step } });
  };
  return {
    client,
    playerId,
    autoSwitchPlayer,
    rewindOneStep: () => rewindTo(client.value.history.length - 2),
    rewindTo,
    restart: () => rewindTo(0),
    addCardToHand(blueprintId: string) {
      worker.postMessage({
        type: 'addCardtoHand',
        payload: { blueprintId, playerId: client.value.getActivePlayerId() }
      });
    },
    addCardToTopOfDeck(blueprintId: string) {
      worker.postMessage({
        type: 'addCardToTopOfDeck',
        payload: { blueprintId, playerId: client.value.getActivePlayerId() }
      });
    },
    addCardToDiscardPile(blueprintId: string) {
      worker.postMessage({
        type: 'addCardToDiscardPile',
        payload: { blueprintId, playerId: client.value.getActivePlayerId() }
      });
    },
    draw() {
      worker.postMessage({
        type: 'draw',
        payload: { playerId: client.value.getActivePlayerId() }
      });
    },
    refillMana() {
      worker.postMessage({
        type: 'refillMana',
        payload: { playerId: client.value.getActivePlayerId() }
      });
    },
    moveUnit(
      unitId: string,
      position: { x: number; y: number },
      silent: boolean
    ) {
      worker.postMessage({
        type: 'moveUnit',
        payload: { unitId, position, silent }
      });
    },
    activateUnit(unitId: string) {
      worker.postMessage({
        type: 'activateUnit',
        payload: { unitId }
      });
    },
    destroyUnit(unitId: string, silent: boolean) {
      worker.postMessage({
        type: 'destroyUnit',
        payload: { unitId, silent }
      });
    },
    bounceUnit(unitId: string, silent: boolean) {
      worker.postMessage({
        type: 'bounceUnit',
        payload: { unitId, silent }
      });
    },
    dealDamageToUnit(unitId: string, amount: number, silent: boolean) {
      worker.postMessage({
        type: 'dealDamage',
        payload: { unitId, amount, silent }
      });
    },
    grantExp(amount: number) {
      worker.postMessage({
        type: 'grantExp',
        payload: { amount, playerId: client.value.getActivePlayerId() }
      });
    }
  };
};
