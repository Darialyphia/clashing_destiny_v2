import type { AnyCard } from '../../card/entities/card.entity';
import { Game } from '../../game/game';
import { GAME_EVENTS } from '../../game/game.events';
import type { TurnEvent } from '../../game/systems/turn.system';
import type { Unit } from '../../unit/unit.entity';
import { ModifierMixin } from '../modifier-mixin';
import type { Modifier } from '../modifier.entity';

export class UntilStartOfNextTurnModifierMixin<
  T extends AnyCard | Unit
> extends ModifierMixin<T> {
  private modifier!: Modifier<T>;

  constructor(game: Game) {
    super(game);
    this.onTurnStart = this.onTurnStart.bind(this);
  }

  async onTurnStart() {
    await this.modifier.target.modifiers.remove(this.modifier.id);
  }

  onApplied(target: T, modifier: Modifier<T>): void {
    this.modifier = modifier;
    this.game.once(GAME_EVENTS.TURN_END, this.onTurnStart);
  }

  onRemoved(): void {
    this.game.off(GAME_EVENTS.TURN_END, this.onTurnStart);
  }

  onReapplied(): void {}
}
