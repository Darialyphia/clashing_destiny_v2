import { assert, type MaybePromise, type Nullable } from '@game/shared';
import { System } from '../../system';
import { EffectChain, type Effect } from '../effect-chain';
import type { Player } from '../../player/player.entity';

export class EffectChainSystem extends System<never> {
  private _currentChain: Nullable<EffectChain> = null;

  initialize() {}

  shutdown() {}

  createChain(opts: {
    initialPlayer: Player;
    initialEffect?: Effect;
    onResolved?: () => MaybePromise<void>;
  }) {
    this._currentChain = new EffectChain(this.game, opts.initialPlayer, async () => {
      await opts.onResolved?.();
      this._currentChain = null;
      await this.game.inputSystem.askForPlayerInput();
    });

    if (opts.initialEffect) {
      this._currentChain.addEffect(opts.initialEffect, opts.initialPlayer);
    }
    void this.game.inputSystem.askForPlayerInput();

    return this.currentChain;
  }

  get currentChain() {
    return this._currentChain;
  }

  addEffect(effect: Effect, player: Player) {
    assert(this._currentChain, 'No active effect chain');
    this._currentChain.addEffect(effect, player);
  }

  pass(player: Player) {
    assert(this._currentChain, 'No active effect chain');
    this._currentChain.pass(player);
  }

  serialize() {
    return this._currentChain?.serialize() ?? null;
  }
}
