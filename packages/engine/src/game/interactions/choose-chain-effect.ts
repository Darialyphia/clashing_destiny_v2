import { assert } from '@game/shared';
import type { Player } from '../../player/player.entity';
import type { Effect } from '../effect-chain';
import type { Game } from '../game';
import {
  InvalidPlayerError,
  NotEnoughCardsError,
  NotEnoughChoicesError,
  TooManyChoicesError
} from '../game-error';
import { INTERACTION_STATE_TRANSITIONS } from '../game.enums';

type ChoosingChainEffectContextOptions = {
  player: Player;
  isElligible(effect: Effect): boolean;
  minChoiceCount: number;
  maxChoiceCount: number;
  label: string;
};

export class ChooseChainEffectContext {
  static async create(game: Game, options: ChoosingChainEffectContextOptions) {
    const instance = new ChooseChainEffectContext(game, options);
    await instance.init();
    return instance;
  }

  private selectedEffects: Effect[] = [];

  private isElligible: (effect: Effect) => boolean;

  private minChoiceCount: number;

  private maxChoiceCount: number;

  readonly player: Player;

  private label: string;

  private constructor(
    private game: Game,
    options: ChoosingChainEffectContextOptions
  ) {
    this.isElligible = options.isElligible;
    this.minChoiceCount = options.minChoiceCount;
    this.maxChoiceCount = options.maxChoiceCount;
    this.player = options.player;
    this.label = options.label;
  }

  async init() {}

  serialize() {
    return {
      player: this.player.id,
      elligibleEffectsIds:
        this.game.effectChainSystem.currentChain?.stack.map(effect => effect.id) ?? [],
      minChoiceCount: this.minChoiceCount,
      maxChoiceCount: this.maxChoiceCount,
      label: this.label
    };
  }

  commit(player: Player, ids: string[]) {
    assert(player.equals(this.player), new InvalidPlayerError());

    assert(
      ids.length >= this.minChoiceCount,
      new NotEnoughChoicesError(this.minChoiceCount, ids.length)
    );
    assert(
      ids.length <= this.maxChoiceCount,
      new TooManyChoicesError(this.maxChoiceCount, ids.length)
    );

    const selectedEffects = ids.map(
      id => this.game.effectChainSystem.currentChain!.getEffectById(id)!
    );
    this.selectedEffects.push(...selectedEffects);

    this.game.interaction.dispatch(
      INTERACTION_STATE_TRANSITIONS.COMMIT_CHOOSING_CHAIN_EFFECT
    );
    this.game.interaction.onInteractionEnd();
    this.game.inputSystem.unpause(this.selectedEffects);
  }
}
