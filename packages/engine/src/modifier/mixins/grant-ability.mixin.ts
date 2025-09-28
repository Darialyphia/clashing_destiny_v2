import type { AbilityBlueprint, PreResponseTarget } from '../../card/card-blueprint';
import type { ArtifactCard } from '../../card/entities/artifact.entity';
import type { HeroCard } from '../../card/entities/hero.entity';
import type { MinionCard } from '../../card/entities/minion.entity';
import type { Game } from '../../game/game';
import { ModifierMixin } from '../modifier-mixin';
import type { Modifier } from '../modifier.entity';

export class GrantAbilityModifierMixin<
  T extends MinionCard | HeroCard | ArtifactCard
> extends ModifierMixin<T> {
  protected modifier!: Modifier<T>;

  protected abilityId!: string;

  constructor(
    game: Game,
    private blueprint: AbilityBlueprint<T, PreResponseTarget>
  ) {
    super(game);
  }

  async onApplied(target: T, modifier: Modifier<T>) {
    this.modifier = modifier;
    const ability = target.addAbility(this.blueprint as any);
    this.abilityId = ability.abilityId;
  }

  async onRemoved() {
    this.modifier.target.removeAbility(this.abilityId);
  }

  onReapplied() {}
}
