import { assert, isDefined } from '@game/shared';
import type { Player } from '../../player/player.entity';
import type { Effect } from '../effect-chain';
import type { Game } from '../game';
import { InvalidPlayerError, UnableToCommitError } from '../game-error';
import { INTERACTION_STATE_TRANSITIONS } from '../game.enums';
import type { AnyCard } from '../../card/entities/card.entity';

export type ChoosingChainEffectContextOptions<T extends boolean = boolean> = {
  player: Player;
  source: AnyCard;
  isElligible(effect: Effect): boolean;
  label: string;
  timeoutFallback: Effect;
  canCancel?: T;
  aiHints: {
    shouldPick: (game: Game, player: Player, effect: Effect) => number;
  };
};

export class ChooseChainEffectContext<T extends boolean = boolean> {
  static async create<T extends boolean = boolean>(
    game: Game,
    options: ChoosingChainEffectContextOptions<T>
  ) {
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
      canCancel: this.options.canCancel ?? false,
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
    this.game.inputSystem.unpause({ cancelled: false, result: this.selectedEffect });
  }

  async cancel(player: Player) {
    assert(player.equals(this.player), new InvalidPlayerError());
    assert(this.options.canCancel, new UnableToCommitError());

    await this.game.interaction.sendTransition(
      INTERACTION_STATE_TRANSITIONS.CANCEL_CHOOSING_CHAIN_EFFECT,
      {}
    );

    this.game.inputSystem.unpause({ cancelled: true, result: null });
  }
}
