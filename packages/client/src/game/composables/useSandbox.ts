import type { NetworkAdapter } from '@game/engine/src/client/client';
import { Game, type GameOptions } from '@game/engine/src/game/game';
import { provideGameClient } from './useGameClient';
import { CARDS_DICTIONARY } from '@game/engine/src/card/sets';

export const useSandbox = (
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

  // @ts-ignore
  window.__debugGame = () => {
    console.log(game);
  };
  const adapter: NetworkAdapter = {
    dispatch: input => {
      return game.dispatch(input);
    },
    subscribe(cb) {
      game.subscribeOmniscient(cb);
    },
    sync(lastSnapshotId) {
      console.log('TODO: sync snapshots from sandbox');
      return Promise.resolve([]);
    }
  };

  const client = provideGameClient({
    adapter,
    gameType: 'local',
    playerId: 'p1'
  });

  game.initialize().then(() => {
    client.value.initialize(game.snapshotSystem.getLatestOmniscientSnapshot());
  });

  return client;
};
