import { assert, type Nullable } from '@game/shared';
import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../game';
import {
  INTERACTION_STATE_TRANSITIONS,
  InvalidPlayerError
} from '../systems/game-interaction.system';
import type { Player } from '../../player/player.entity';

type AskQuestionContextOptions = {
  questionId: string;
  player: Player;
  source: AnyCard;
  choices: Array<{ id: string; label: string }>;
  label: string;
};
export class AskQuestionContext {
  static async create(game: Game, options: AskQuestionContextOptions) {
    const instance = new AskQuestionContext(game, options);
    await instance.init();
    return instance;
  }

  private selectedChoice: Nullable<{ id: string; label: string }> = null;

  private choices: Array<{ id: string; label: string }> = [];

  readonly player: Player;

  private label: string;

  private source: AnyCard;

  private questionId!: string;

  private constructor(
    private game: Game,
    options: AskQuestionContextOptions
  ) {
    this.choices = options.choices;
    this.player = options.player;
    this.label = options.label;
    this.questionId = options.questionId;
    this.source = options.source;
  }

  async init() {}

  serialize() {
    return {
      questionId: this.questionId,
      player: this.player.id,
      source: this.source.id,
      choices: this.choices,
      label: this.label
    };
  }

  commit(player: Player, id: string) {
    assert(player.equals(this.player), new InvalidPlayerError());

    this.selectedChoice = this.choices.find(choice => choice.id === id);
    this.game.interaction.dispatch(INTERACTION_STATE_TRANSITIONS.COMMIT_ASKING_QUESTION);
    this.game.interaction.onInteractionEnd();
    this.game.inputSystem.unpause(this.selectedChoice!.id);
  }
}
