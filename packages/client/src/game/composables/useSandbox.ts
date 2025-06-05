import type { NetworkAdapter } from '@game/engine/src/client/client';
import { Game, type GameOptions } from '@game/engine/src/game/game';

export const useSandbox = (
  options: Pick<GameOptions, 'players' | 'rngSeed'>
) => {
  const game = new Game({
    id: 'sandbox',
    rngSeed: options.rngSeed,
    history: [],
    overrides: {},
    players: options.players
  });

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
};
