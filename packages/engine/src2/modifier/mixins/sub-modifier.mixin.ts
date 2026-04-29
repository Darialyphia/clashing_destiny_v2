import type { Game } from '../../game/game';
import { ModifierMixin } from '../modifier-mixin';
import type { Modifier, ModifierTarget } from '../modifier.entity';

export class SubModifierMixin<
  T extends ModifierTarget,
  TTarget extends ModifierTarget
> extends ModifierMixin<T> {
  private subModifierTargets = new Map<TTarget, Modifier<TTarget>>();
  constructor(
    game: Game,
    private readonly options: {
      getTargets: () => Array<{
        target: TTarget;
        modifier: Modifier<TTarget>;
      }>;
    }
  ) {
    super(game);
  }

  async onApplied() {
    for (const target of this.options.getTargets()) {
      await target.target.modifiers.add(target.modifier);
      this.subModifierTargets.set(target.target, target.modifier);
    }
  }

  async onRemoved(): Promise<void> {
    for (const [target, modifier] of this.subModifierTargets.entries()) {
      await target.modifiers.remove(modifier);
    }
    this.subModifierTargets.clear();
  }

  onReapplied(): void {}
}
