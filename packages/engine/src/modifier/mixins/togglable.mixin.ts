import type { Game } from '../../game/game';
import { ModifierMixin } from '../modifier-mixin';
import type { Modifier, ModifierTarget } from '../modifier.entity';

export class TogglableModifierMixin<T extends ModifierTarget> extends ModifierMixin<T> {
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
      if (this.modifier.isEnabled) return;
      this.modifier.enable();
    } else {
      if (!this.modifier.isEnabled) return;
      this.modifier.disable();
    }
  }

  onApplied(target: T, modifier: Modifier<T>): void {
    this.modifier = modifier;
    this.game.on('*', this.check);
  }

  onRemoved(): void {
    if (this.modifier.isEnabled) {
      // only stop checking when the modifier is removed, but keep checking wen disabled
      this.game.off('*', this.check);
    }
  }

  onReapplied() {}
}
