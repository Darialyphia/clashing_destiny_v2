import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../../game/game';
import { ModifierMixin } from '../modifier-mixin';
import type { Modifier, ModifierEventMap } from '../modifier.entity';

export class TogglableModifierMixin<T extends AnyCard> extends ModifierMixin<T> {
  private modifier!: Modifier<T>;

  constructor(
    game: Game,
    private predicate: () => boolean
  ) {
    super(game);
    this.check = this.check.bind(this);
  }

  check() {
    if (this.predicate()) {
      this.modifier.enable();
    } else {
      this.modifier.disable();
    }
  }

  onApplied(target: T, modifier: Modifier<T>): void {
    this.modifier = modifier;
    this.game.on('*', this.check);
  }

  onRemoved(): void {
    this.game.off('*', this.check);
  }

  onReapplied() {}
}
