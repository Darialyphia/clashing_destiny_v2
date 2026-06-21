import { assert, isDefined } from '@game/shared';
import type { Player } from '../../player/player.entity';
import type { Effect } from '../effect-chain';
import type { Game } from '../game';
import { InvalidPlayerError } from '../game-error';
import { INTERACTION_STATE_TRANSITIONS } from '../game.enums';
import type { AnyCard } from '../../card/entities/card.entity';

export type ChoosingChainEffectContextOptions = {
  player: Player;
  source: AnyCard;
  isElligible(effect: Effect): boolean;
  label: string;
  timeoutFallback: Effect;
  aiHints: {
    shouldPick: (game: Game, player: Player, effect: Effect) => number;
  };
};

export class ChooseChainEffectContext {
  static async create(game: Game, options: ChoosingChainEffectContextOptions) {
    const instance = new ChooseChainEffectContext(game, options);
    await instance.init();
    return instance;
  }

  private selectedEffect: Effect | null = null;

  private isElligible: (effect: Effect) => boolean;

  readonly player: Player;

  private label: string;

  private timeoutFallback: Effect;

  private constructor(
    private game: Game,
    private options: ChoosingChainEffectContextOptions
  ) {
    this.isElligible = options.isElligible;
    this.player = options.player;
    this.label = options.label;
    this.timeoutFallback = options.timeoutFallback;
  }

  async init() {}

  serialize() {
    return {
      player: this.player.id,
      elligibleEffectsIds:
        this.game.effectChainSystem.currentChain?.stack.map(effect => effect.id) ?? [],
      label: this.label,
      canCancel: false,
      source: this.options.source.id
    };
  }

  commit(player: Player, id: string | null) {
    assert(player.equals(this.player), new InvalidPlayerError());

    this.selectedEffect = isDefined(id)
      ? this.game.effectChainSystem.currentChain!.getEffectById(id)!
      : this.timeoutFallback;

    this.game.interaction.dispatch(
      INTERACTION_STATE_TRANSITIONS.COMMIT_CHOOSING_CHAIN_EFFECT
    );
    this.game.interaction.onInteractionEnd();
    this.game.inputSystem.unpause(this.selectedEffect);
  }

  async cancel(player: Player) {
    assert(player.equals(this.player), new InvalidPlayerError());
    await this.game.interaction.sendTransition(
      INTERACTION_STATE_TRANSITIONS.CANCEL_CHOOSING_CHAIN_EFFECT,
      {}
    );

    this.game.inputSystem.unpause({ cancelled: true, result: null });
  }
}
