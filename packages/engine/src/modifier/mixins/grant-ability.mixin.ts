import type { AbilityBlueprint, Targets } from '../../card/card-blueprint';
import type { AbilityOwner } from '../../card/entities/ability.entity';
import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../../game/game';
import { ModifierMixin } from '../modifier-mixin';
import type { Modifier } from '../modifier.entity';

export class GrantAbilityModifierMixin<T extends AbilityOwner> extends ModifierMixin<T> {
  protected modifier!: Modifier<T>;

  protected abilityId!: string;

  constructor(
    game: Game,
    private blueprint: AbilityBlueprint<T, AnyCard>
  ) {
    super(game);
  }

  async onApplied(target: T, modifier: Modifier<T>) {
    this.modifier = modifier;
    if (target.abilityManager.hasAbility(this.blueprint.id)) return;

    const ability = target.addAbility(this.blueprint as any);
    this.abilityId = ability.abilityId;
  }

  async onRemoved() {
    this.modifier.target.removeAbility(this.abilityId);
  }

  async onReapplied() {}
}
