import type { AnyCard } from '../../card/entities/card.entity';
import type { MinionCard } from '../../card/entities/minion-card.entity';
import type { Game } from '../../game/game';
import { GAME_EVENTS } from '../../game/game.events';
import type { UnitAfterDestroyEvent } from '../../unit/unit-events';
import { ModifierMixin } from '../modifier-mixin';
import type { Modifier } from '../modifier.entity';

export class RemoveOnDestroyedMixin extends ModifierMixin<MinionCard> {
  private modifier!: Modifier<AnyCard>;

  constructor(game: Game) {
    super(game);
    this.onMinionDestroyed = this.onMinionDestroyed.bind(this);
  }

  async onMinionDestroyed(event: UnitAfterDestroyEvent) {
    if (event.data.unit.card.equals(this.modifier.target)) {
      this.game.off(GAME_EVENTS.UNIT_AFTER_DESTROY, this.onMinionDestroyed);
      await this.modifier.target.modifiers.remove(this.modifier);
    }
  }

  onApplied(target: MinionCard, modifier: Modifier<MinionCard>): void {
    this.modifier = modifier;

    this.game.on(GAME_EVENTS.UNIT_AFTER_DESTROY, this.onMinionDestroyed);
  }

  onRemoved(): void {
    this.game.off(GAME_EVENTS.UNIT_AFTER_DESTROY, this.onMinionDestroyed);
  }

  onReapplied(): void {}
}
