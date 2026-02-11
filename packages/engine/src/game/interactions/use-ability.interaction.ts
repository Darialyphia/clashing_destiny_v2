import { assert } from '@game/shared';
import type { Player } from '../../player/player.entity';
import type { Game } from '../game';
import type { Ability, AbilityOwner } from '../../card/entities/ability.entity';
import { INTERACTION_STATE_TRANSITIONS } from '../game.enums';
import { InvalidPlayerError } from '../game-error';

type UseAbilityContextOptions = {
  ability: Ability<AbilityOwner>;
  player: Player;
};

export class UseAbilityContext {
  static async create(
    game: Game,
    options: UseAbilityContextOptions
  ): Promise<UseAbilityContext> {
    const instance = new UseAbilityContext(game, options);
    await instance.init();
    return instance;
  }

  private ability: Ability<AbilityOwner>;

  readonly player: Player;

  private constructor(
    private game: Game,
    options: UseAbilityContextOptions
  ) {
    this.player = options.player;
    this.ability = options.ability;
  }

  async init() {}

  serialize() {
    return {
      ability: this.ability.id,
      card: this.ability.card.id,
      player: this.player.id
    };
  }

  async commit(player: Player, manaCostIndices: number[] | null) {
    assert(player.equals(this.player), new InvalidPlayerError());
    this.game.interaction.dispatch(INTERACTION_STATE_TRANSITIONS.COMMIT_USING_ABILITY);
    this.game.interaction.onInteractionEnd();

    const indicesToUse =
      manaCostIndices ??
      Array.from({ length: this.ability.card.manaCost }, (_, index) => index);

    await this.player.useAbility(this.ability, indicesToUse, async () => {
      await this.game.turnSystem.switchInitiative();
    });
  }

  async cancel(player: Player) {
    assert(player.equals(this.player), new InvalidPlayerError());
    this.game.interaction.dispatch(INTERACTION_STATE_TRANSITIONS.CANCEL_USING_ABILITY);
    this.game.interaction.onInteractionEnd();
  }
}
