import { assert, isDefined } from '@game/shared';
import type { Game } from '../game';
import {
  INTERACTION_STATE_TRANSITIONS,
  InvalidPlayerError,
  UnableToCommitError
} from '../systems/game-interaction.system';
import type { Player } from '../../player/player.entity';
import type { SpellSchool } from '../../card/card.enums';

type ChoosingAffinityContextOptions = {
  player: Player;
  choices: SpellSchool[];
  label: string;
};
export class ChoosingAffinityContext {
  static async create(game: Game, options: ChoosingAffinityContextOptions) {
    const instance = new ChoosingAffinityContext(game, options);
    await instance.init();
    return instance;
  }

  private selectedAffinity: SpellSchool | null = null;

  private choices: SpellSchool[] = [];

  readonly player: Player;

  private label: string;

  private constructor(
    private game: Game,
    options: ChoosingAffinityContextOptions
  ) {
    this.choices = options.choices;
    this.player = options.player;
    this.label = options.label;
  }

  async init() {}

  serialize() {
    return {
      player: this.player.id,
      choices: this.choices,
      label: this.label
    };
  }

  commit(player: Player, affinity: SpellSchool | null) {
    assert(player.equals(this.player), new InvalidPlayerError());
    if (isDefined(affinity)) {
      assert(this.choices.includes(affinity), new UnableToCommitError());
    }

    this.selectedAffinity = affinity;

    this.game.interaction.dispatch(
      INTERACTION_STATE_TRANSITIONS.COMMIT_CHOOSING_AFFINITY
    );
    this.game.interaction.onInteractionEnd();
    this.game.inputSystem.unpause(this.selectedAffinity);
  }
}
