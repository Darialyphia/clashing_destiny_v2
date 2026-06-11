import type { CardLocation, JobId } from '../../card/card.enums';
import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../../game/game';
import type { RuneCost } from '../../player/components/rune-manager.component';
import { ModifierMixin } from '../modifier-mixin';
import type { Modifier, ModifierTarget } from '../modifier.entity';

export class TogglableModifierMixin<T extends ModifierTarget> extends ModifierMixin<T> {
  protected modifier!: Modifier<T>;

  constructor(
    game: Game,
    private predicate: () => boolean
  ) {
    super(game);
    this.check = this.check.bind(this);
  }

  check(val: boolean) {
    if (!val) return val;

    return this.predicate();
  }

  async onApplied(target: T, modifier: Modifier<T>) {
    this.modifier = modifier;
    await this.modifier.addInterceptor('isEnabled', this.check);
  }

  async onRemoved() {
    // only remove the interceptor if the modifier is being remove, not disabled
    // otherwise it'd cause an infinite loop
    if (!this.modifier.isApplied) {
      await this.modifier.removeInterceptor('isEnabled', this.check);
    }
  }

  async onReapplied() {}
}

export class JobBonusToggleModifierMixin<
  T extends AnyCard
> extends TogglableModifierMixin<T> {
  constructor(
    game: Game,
    source: AnyCard,
    private jobId: JobId
  ) {
    super(game, () => source.player.hero.hasJob(this.jobId));
  }
}

export class RuneCostToggleModifierMixin<
  T extends AnyCard
> extends TogglableModifierMixin<T> {
  constructor(
    game: Game,
    source: AnyCard,
    private cost: RuneCost
  ) {
    super(game, () => source.player.runeManager.has(this.cost));
  }
}

export class LocationToggleModifierMixin<
  T extends AnyCard
> extends TogglableModifierMixin<T> {
  constructor(
    game: Game,
    private location: CardLocation[]
  ) {
    super(game, () =>
      this.location.some(location => this.modifier.target.location === location)
    );
  }
}
