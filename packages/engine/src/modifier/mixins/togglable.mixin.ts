import { AFFINITIES, type Affinity, type CardLocation } from '../../card/card.enums';
import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../../game/game';
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

export class AffinitiesTogglableModifierMixin<
  T extends AnyCard
> extends TogglableModifierMixin<T> {
  constructor(
    game: Game,
    private affinities: Affinity[]
  ) {
    super(game, () => {
      const available = Object.fromEntries(
        Object.values(AFFINITIES).map(affinity => [affinity, 0])
      ) as Record<Affinity, number>;
      this.modifier.target.player.cardManager.runeZone.forEach(card => {
        card.affinities.forEach(affinity => {
          available[affinity]++;
        });
      });
      const nonNeutralCost = this.affinities.filter(
        affinity => affinity !== AFFINITIES.NEUTRAL
      );
      const neutralCost = this.affinities.filter(
        affinity => affinity === AFFINITIES.NEUTRAL
      );

      // try to pay non neutral cost first
      for (const rune of nonNeutralCost) {
        if (available[rune] > 0) {
          available[rune]--;
        } else {
          return false;
        }
      }

      const remaining = Object.values(available).reduce((sum, count) => sum + count, 0);

      return remaining >= neutralCost.length;
    });
  }
}
