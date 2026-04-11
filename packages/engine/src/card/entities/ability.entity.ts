import type { Serializable } from '@game/shared';
import type { Game } from '../../game/game';
import type { AbilityBlueprint } from '../card-blueprint';
import type { AnyCard } from './card.entity';
import { Interceptable } from '../../utils/interceptable';
import { EntityWithModifiers } from '../../utils/entity-with-modifiers';

export type SerializedAbility = {
  entityType: 'ability';
  id: string;
  canUse: boolean;
  description: string;
  cooldown: number;
  manaCost: number;
  lastUsedAt: number | null;
};

export type AbilityInterceptor = {
  manaCost: Interceptable<number>;
  canUse: Interceptable<boolean>;
  cooldown: Interceptable<number>;
  shouldSwitchInitiativeAfterUse: Interceptable<boolean>;
};

export class Ability<T extends AnyCard>
  extends EntityWithModifiers<AbilityInterceptor>
  implements Serializable<SerializedAbility>
{
  private lastUsedAt: number | null = null;

  constructor(
    game: Game,
    private card: T,
    public blueprint: AbilityBlueprint<T>
  ) {
    super(`${card.id}-ability-${blueprint.id}`, game, {
      manaCost: new Interceptable(),
      canUse: new Interceptable(),
      cooldown: new Interceptable(),
      shouldSwitchInitiativeAfterUse: new Interceptable()
    });
  }

  get abilityId() {
    return this.blueprint.id;
  }

  get manaCost() {
    return this.interceptors.manaCost.getValue(this.blueprint.manaCost, {});
  }

  get cooldown() {
    return this.interceptors.cooldown.getValue(
      this.blueprint.getCooldown(this.game, this.card),
      {}
    );
  }

  get isOnCooldown() {
    if (this.lastUsedAt === null) {
      return false;
    }
    return this.lastUsedAt + this.cooldown > this.game.turnSystem.elapsedTurns;
  }

  get canUse() {
    return this.interceptors.canUse.getValue(
      this.blueprint.canUse(this.game, this.card) &&
        this.card.player.canSpendMana(this.blueprint.manaCost) &&
        !this.isOnCooldown,
      {}
    );
  }

  get shouldSwitchInitiativeAfterUse() {
    return this.interceptors.shouldSwitchInitiativeAfterUse.getValue(true, {});
  }

  async use() {
    this.lastUsedAt = this.game.turnSystem.elapsedTurns;
    await this.card.player.spendMana(this.manaCost);
    const targets = await this.blueprint.getTargets(this.game, this.card);
    const aoe = this.blueprint.getAoe(this.game, this.card, targets);

    await this.blueprint.onResolve(this.game, this.card, {
      targets,
      aoe
    });
  }

  serialize(): SerializedAbility {
    return {
      entityType: 'ability',
      id: this.id,
      canUse: this.canUse,
      description: this.blueprint.description,
      cooldown: this.cooldown,
      manaCost: this.manaCost,
      lastUsedAt: this.lastUsedAt
    };
  }
}
