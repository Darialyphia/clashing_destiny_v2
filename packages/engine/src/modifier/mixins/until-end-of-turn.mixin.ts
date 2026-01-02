import { Game } from '../../game/game';
import { TURN_EVENTS } from '../../game/game.enums';
import { ModifierMixin } from '../modifier-mixin';
import type { Modifier, ModifierTarget } from '../modifier.entity';

export class UntilEndOfTurnModifierMixin<
  T extends ModifierTarget
> extends ModifierMixin<T> {
  private modifier!: Modifier<T>;

  constructor(game: Game) {
    super(game);
    this.onTurnEnd = this.onTurnEnd.bind(this);
  }

  async onTurnEnd() {
    console.log('UntilEndOfTurnModifierMixin removing modifier', this.modifier);
    await this.modifier.remove();
  }

  onApplied(target: T, modifier: Modifier<T>): void {
    this.modifier = modifier;
    this.game.once(TURN_EVENTS.TURN_END, this.onTurnEnd);
  }

  onRemoved(): void {
    this.game.off(TURN_EVENTS.TURN_END, this.onTurnEnd);
  }

  onReapplied(): void {}
}
