import { assert } from '@game/shared';
import type { Player } from '../../player/player.entity';
import type { Game } from '../game';
import type { Ability, AbilityOwner } from '../../card/entities/ability.entity';
import { INTERACTION_STATE_TRANSITIONS } from '../game.enums';
import { InvalidPlayerError } from '../game-error';

export type UseAbilityContextOptions = {
  ability: Ability<AbilityOwner>;
  player: Player;
  canCancel: boolean;
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

  private _ability: Ability<AbilityOwner>;

  readonly player: Player;

  private constructor(
    private game: Game,
    private options: UseAbilityContextOptions
  ) {
    this.player = options.player;
    this._ability = options.ability;
  }

  async init() {}

  serialize() {
    return {
      ability: this._ability.id,
      card: this._ability.card.id,
      player: this.player.id,
      canCancel: this.options.canCancel
    };
  }

  get ability() {
    return this._ability;
  }

  async commit(player: Player) {
    assert(player.equals(this.player), new InvalidPlayerError());
    await this.game.interaction.sendTransition(
      INTERACTION_STATE_TRANSITIONS.COMMIT_USING_ABILITY,
      {}
    );

    await this.player.useAbility(this._ability, async () => {
      console.log('Ability resolved');
      await this.game.turnSystem.switchInitiative();
    });
  }

  async cancel(player: Player) {
    assert(player.equals(this.player), new InvalidPlayerError());
    await this.game.interaction.sendTransition(
      INTERACTION_STATE_TRANSITIONS.CANCEL_USING_ABILITY,
      {}
    );
  }
}
