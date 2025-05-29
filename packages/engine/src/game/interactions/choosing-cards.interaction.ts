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

type ChoosingCardsContextOptions = {
  player: Player;
  choices: AnyCard[];
  minChoiceCount: number;
  maxChoiceCount: number;
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

  private player: Player;

  private constructor(
    private game: Game,
    options: ChoosingCardsContextOptions
  ) {
    this.choices = options.choices;
    this.minChoiceCount = options.minChoiceCount;
    this.maxChoiceCount = options.maxChoiceCount;
    this.player = options.player;
  }

  async init() {}

  serialize() {
    return {
      choices: this.choices.map(card => card.id),
      minChoiceCount: this.minChoiceCount,
      maxChoiceCount: this.maxChoiceCount
    };
  }

  commit(player: Player, indices: number[]) {
    assert(player.equals(this.player), new InvalidPlayerError());

    assert(indices.length >= this.minChoiceCount, new NotEnoughCardsError());
    assert(indices.length <= this.maxChoiceCount, new TooManyCardsError());

    const selectedCards = indices.map(index => this.choices[index]);
    this.selectedCards.push(...selectedCards);

    this.game.interaction.dispatch(INTERACTION_STATE_TRANSITIONS.COMMIT_CHOOSING_CARDS);
    this.game.interaction.onInteractionEnd();
    this.game.inputSystem.unpause(this.selectedCards);
  }
}
