import type { AnyCard } from '../../card/entities/card.entity';
import { Game } from '../../game/game';
import { GAME_EVENTS } from '../../game/game.events';
import { ModifierMixin } from '../modifier-mixin';
import type { Modifier } from '../modifier.entity';

export class UntilEndOfTurnModifierMixin extends ModifierMixin<AnyCard> {
  private modifier!: Modifier<AnyCard>;

  constructor(game: Game) {
    super(game);
    this.onTurnEnd = this.onTurnEnd.bind(this);
  }

  async onTurnEnd() {
    await this.modifier.target.modifiers.remove(this.modifier.id);
  }

  onApplied(target: AnyCard, modifier: Modifier<AnyCard>): void {
    this.modifier = modifier;
    this.game.once(GAME_EVENTS.TURN_END, this.onTurnEnd);
  }

  onRemoved(): void {
    this.game.off(GAME_EVENTS.TURN_END, this.onTurnEnd);
  }

  onReapplied(): void {}
}
