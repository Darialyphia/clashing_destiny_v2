import { isDefined } from '@game/shared';
import type { MinionCard } from '../../card/entities/minion-card.entity';
import { MINION_EVENTS, MinionAfterSummonedEvent } from '../../card/events/minion.events';
import type { Game } from '../../game/game';
import type { Unit } from '../../unit/unit.entity';
import { ModifierMixin } from '../modifier-mixin';
import type { Modifier } from '../modifier.entity';

export class UnitEffectModifierMixin<T extends MinionCard> extends ModifierMixin<T> {
  modifier!: Modifier<T>;

  modifierToAdd!: Modifier<Unit>;

  constructor(
    game: Game,
    private options: {
      getModifier: (unit: Unit) => Modifier<Unit>;
    }
  ) {
    super(game);
    this.onAfterSummoned = this.onAfterSummoned.bind(this);
  }

  private async addModifier(unit: Unit) {
    this.modifierToAdd = this.options.getModifier(unit);
    await unit.modifiers.add(this.modifierToAdd);
  }

  private async onAfterSummoned(event: MinionAfterSummonedEvent) {
    if (!event.data.card.equals(this.modifier.target)) return;
    await this.addModifier(event.data.card.unit!);
  }

  async onApplied(target: T, modifier: Modifier<T>) {
    this.modifier = modifier;
    if (isDefined(this.modifier.target.unit)) {
      await this.addModifier(this.modifier.target.unit!);
    }
    this.game.on(MINION_EVENTS.MINION_AFTER_SUMMON, this.onAfterSummoned);
  }

  async onRemoved() {
    this.game.off(MINION_EVENTS.MINION_AFTER_SUMMON, this.onAfterSummoned);
    if (isDefined(this.modifier.target.unit)) {
      await this.modifierToAdd.remove();
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onReapplied(): void {}
}
