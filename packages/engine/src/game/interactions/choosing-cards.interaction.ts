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

type ChoosingCardsContextOptions = {
  player: Player;
  choices: AnyCard[];
  minChoiceCount: number;
  maxChoiceCount: number;
  label: string;
  timeoutFallback: AnyCard[];
};
export class ChoosingCardsContext {
  static async create(game: Game, options: ChoosingCardsContextOptions) {
    const instance = new ChoosingCardsContext(game, options);
    await instance.init();
    return instance;
  }

  private selectedCards: AnyCard[] = [];

  private choices: AnyCard[] = [];

  private minChoiceCount: number;

  private maxChoiceCount: number;

  readonly player: Player;

  private label: string;

  private timeoutFallback: AnyCard[];

  private constructor(
    private game: Game,
    options: ChoosingCardsContextOptions
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
      choices: this.choices.map(card => card.id),
      minChoiceCount: this.minChoiceCount,
      maxChoiceCount: this.maxChoiceCount,
      label: this.label
    };
  }

  commit(player: Player, indices: number[] | null) {
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

      this.selectedCards.push(...indices.map(index => this.choices[index]));
    } else {
      this.selectedCards.push(...this.timeoutFallback);
    }

    this.game.interaction.dispatch(INTERACTION_STATE_TRANSITIONS.COMMIT_CHOOSING_CARDS);
    this.game.interaction.onInteractionEnd();
    this.game.inputSystem.unpause(this.selectedCards);
  }
}
