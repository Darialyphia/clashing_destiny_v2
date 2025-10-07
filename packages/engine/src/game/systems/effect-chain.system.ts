import { assert, type MaybePromise, type Nullable } from '@game/shared';
import { System } from '../../system';
import { EffectChain, type Effect } from '../effect-chain';
import type { Player } from '../../player/player.entity';

export class EffectChainSystem extends System<never> {
  private _currentChain: Nullable<EffectChain> = null;

  initialize() {}

  shutdown() {}

  async createChain(opts: {
    initialPlayer: Player;
    initialEffect?: Effect;
    onResolved?: () => MaybePromise<void>;
  }) {
    this._currentChain = await EffectChain.create(
      this.game,
      opts.initialPlayer,
      async () => {
        await opts.onResolved?.();
        this._currentChain = null;
        await this.game.inputSystem.askForPlayerInput();
      }
    );

    if (opts.initialEffect) {
      await this._currentChain.addEffect(opts.initialEffect, opts.initialPlayer);
    }
    void this.game.inputSystem.askForPlayerInput();

    return this.currentChain;
  }

  get currentChain() {
    return this._currentChain;
  }

  async addEffect(effect: Effect, player: Player) {
    assert(this._currentChain, 'No active effect chain');
    await this._currentChain.addEffect(effect, player);
  }

  async pass(player: Player) {
    assert(this._currentChain, 'No active effect chain');
    await this._currentChain.pass(player);
  }

  serialize() {
    return this._currentChain?.serialize() ?? null;
  }
}
