import { assert } from '@game/shared';
import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../game';
import type { Player } from '../../player/player.entity';
import { INTERACTION_STATE_TRANSITIONS } from '../game.enums';
import {
  InvalidPlayerError,
  NotEnoughCardsError,
  TooManyCardsError
} from '../game-error';

type ChoosingCardsContextOptions = {
  player: Player;
  choices: AnyCard[];
  minChoiceCount: number;
  maxChoiceCount: number;
  label: string;
  source: AnyCard;
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

  public source: AnyCard;

  private constructor(
    private game: Game,
    options: ChoosingCardsContextOptions
  ) {
    this.choices = options.choices;
    this.minChoiceCount = options.minChoiceCount;
    this.maxChoiceCount = options.maxChoiceCount;
    this.player = options.player;
    this.label = options.label;
    this.source = options.source;
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

  commit(player: Player, indices: number[]) {
    assert(player.equals(this.player), new InvalidPlayerError());

    assert(
      indices.length >= this.minChoiceCount,
      new NotEnoughCardsError(this.minChoiceCount, indices.length)
    );
    assert(
      indices.length <= this.maxChoiceCount,
      new TooManyCardsError(this.maxChoiceCount, indices.length)
    );

    const selectedCards = indices.map(index => this.choices[index]);
    this.selectedCards.push(...selectedCards);

    this.game.interaction.dispatch(INTERACTION_STATE_TRANSITIONS.COMMIT_CHOOSING_CARDS);
    this.game.interaction.onInteractionEnd();
    this.game.inputSystem.unpause(this.selectedCards);
  }

  cancel(player: Player) {
    assert(player.equals(this.player), new InvalidPlayerError());
    this.game.interaction.dispatch(INTERACTION_STATE_TRANSITIONS.CANCEL_CHOOSING_CARDS);
    this.game.interaction.onInteractionEnd();
    this.game.inputSystem.unpause([]);
  }
}
