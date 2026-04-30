import { assert, isDefined } from '@game/shared';
import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../game';
import {
  NotEnoughCardsError,
  TooManyCardsError,
  InvalidPlayerError
} from '../game-error';
import type { Player } from '../../player/player.entity';
import { INTERACTION_STATE_TRANSITIONS } from '../game.enums';

export type ChoosingCardsContextOptions = {
  player: Player;
  choices: Array<{
    card: AnyCard;
    aiHints: {
      shouldPick: (game: Game, player: Player) => number;
    };
  }>;
  minChoiceCount: number;
  maxChoiceCount: number;
  label: string;
  timeoutFallback: AnyCard[];
  canCancel: boolean;
};
export class ChoosingCardsContext {
  static async create(game: Game, options: ChoosingCardsContextOptions) {
    const instance = new ChoosingCardsContext(game, options);
    await instance.init();
    return instance;
  }

  private selectedCards: AnyCard[] = [];

  private choices: Array<{
    card: AnyCard;
    aiHints: {
      shouldPick: (game: Game, player: Player) => number;
    };
  }> = [];

  readonly minChoiceCount: number;

  readonly maxChoiceCount: number;

  readonly player: Player;

  private label: string;

  private timeoutFallback: AnyCard[];

  private constructor(
    private game: Game,
    private options: ChoosingCardsContextOptions
  ) {
    this.choices = options.choices;
    this.minChoiceCount = options.minChoiceCount;
    this.maxChoiceCount = options.maxChoiceCount;
    this.player = options.player;
    this.label = options.label;
    this.timeoutFallback = options.timeoutFallback;
  }

  async init() {}

  serialize() {
    return {
      player: this.player.id,
      choices: this.choices.map(choice => choice.card.id),
      minChoiceCount: this.minChoiceCount,
      maxChoiceCount: this.maxChoiceCount,
      label: this.label,
      canCancel: this.options.canCancel
    };
  }

  async commit(player: Player, indices: number[] | null) {
    assert(player.equals(this.player), new InvalidPlayerError());
    if (isDefined(indices)) {
      assert(
        indices.length >= this.minChoiceCount,
        new NotEnoughCardsError(this.minChoiceCount, indices.length)
      );
      assert(
        indices.length <= this.maxChoiceCount,
        new TooManyCardsError(this.maxChoiceCount, indices.length)
      );

      this.selectedCards.push(...indices.map(index => this.choices[index].card));
    } else {
      this.selectedCards.push(...this.timeoutFallback);
    }

    await this.game.interaction.sendTransition(
      INTERACTION_STATE_TRANSITIONS.COMMIT_CHOOSING_CARDS,
      {}
    );
    this.game.inputSystem.unpause({ cancelled: false, result: this.selectedCards });
  }

  async cancel(player: Player) {
    assert(player.equals(this.player), new InvalidPlayerError());
    await this.game.interaction.sendTransition(
      INTERACTION_STATE_TRANSITIONS.CANCEL_CHOOSING_CARDS,
      {}
    );

    this.game.inputSystem.unpause({ cancelled: true, result: null });
  }

  getChoices() {
    return [...this.choices];
  }
}
