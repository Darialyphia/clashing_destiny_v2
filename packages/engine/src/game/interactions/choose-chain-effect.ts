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
  label: string;
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

  private constructor(
    private game: Game,
    options: ChoosingChainEffectContextOptions
  ) {
    this.isElligible = options.isElligible;
    this.player = options.player;
    this.label = options.label;
  }

  async init() {}

  serialize() {
    return {
      player: this.player.id,
      elligibleEffectsIds:
        this.game.effectChainSystem.currentChain?.stack.map(effect => effect.id) ?? [],
      label: this.label
    };
  }

  commit(player: Player, id: string) {
    assert(player.equals(this.player), new InvalidPlayerError());

    this.selectedEffect = this.game.effectChainSystem.currentChain!.getEffectById(id)!;

    this.game.interaction.dispatch(
      INTERACTION_STATE_TRANSITIONS.COMMIT_CHOOSING_CHAIN_EFFECT
    );
    this.game.interaction.onInteractionEnd();
    this.game.inputSystem.unpause(this.selectedEffect);
  }
}
