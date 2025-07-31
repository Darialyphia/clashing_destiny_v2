import type { NetworkAdapter } from '@game/engine/src/client/client';
import { Game, type GameOptions } from '@game/engine/src/game/game';
import { provideGameClient } from './useGameClient';
import { CARDS_DICTIONARY } from '@game/engine/src/card/sets';
import { useFxAdapter } from './useFxAdapter';

export const useTutorial = (
  options: Pick<GameOptions, 'players' | 'rngSeed'>
) => {
  const game = new Game({
    id: 'sandbox',
    rngSeed: options.rngSeed,
    history: [],
    overrides: {
      cardPool: CARDS_DICTIONARY
    },
    players: options.players
  });

  // @ts-expect-error
  window.__debugGame = () => {
    console.log(game);
  };
  // @ts-expect-error
  window.__debugClient = () => {
    console.log(client.value);
  };
  const networkAdapter: NetworkAdapter = {
    dispatch: input => {
      return game.dispatch(input);
    },
    subscribe(cb) {
      game.subscribeOmniscient(cb);
    },
    sync(lastSnapshotId) {
      console.log('TODO: sync snapshots from sandbox', lastSnapshotId);
      return Promise.resolve([]);
    }
  };

  const fxAdapter = useFxAdapter();

  const client = provideGameClient({
    networkAdapter,
    fxAdapter,
    gameType: 'local',
    playerId: 'p1'
  });

  game.initialize().then(() => {
    client.value.initialize(game.snapshotSystem.getLatestOmniscientSnapshot());
  });

  return client;
};
