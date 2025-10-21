import { assert } from '@game/shared';
import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../game';
import {
  NotEnoughCardsError,
  TooManyCardsError,
  INTERACTION_STATE_TRANSITIONS,
  InvalidPlayerError
} from '../systems/game-interaction.system';
import type { Player } from '../../player/player.entity';

type AskQuestionContextOptions = {
  player: Player;
  source: AnyCard;
  choices: Array<{ id: string; label: string }>;
  minChoiceCount: number;
  maxChoiceCount: number;
  label: string;
};
export class AskQuestionContext {
  static async create(game: Game, options: AskQuestionContextOptions) {
    const instance = new AskQuestionContext(game, options);
    await instance.init();
    return instance;
  }

  private selectedChoices: Array<{ id: string; label: string }> = [];

  private choices: Array<{ id: string; label: string }> = [];

  private minChoiceCount: number;

  private maxChoiceCount: number;

  readonly player: Player;

  private label: string;

  private source: AnyCard;

  private constructor(
    private game: Game,
    options: AskQuestionContextOptions
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
      source: this.source.id,
      choices: this.choices,
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
    this.selectedChoices.push(...selectedCards);

    this.game.interaction.dispatch(INTERACTION_STATE_TRANSITIONS.COMMIT_ASKING_QUESTION);
    this.game.interaction.onInteractionEnd();
    this.game.inputSystem.unpause(this.selectedChoices.map(c => c.id));
  }
}
