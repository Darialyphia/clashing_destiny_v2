import type { AbilityOwner } from '../../card/entities/ability.entity';
import type { Game } from '../../game/game';
import { ModifierMixin } from '../modifier-mixin';

export class RemoveAbilitiesModifierMixin<
  T extends AbilityOwner
> extends ModifierMixin<T> {
  constructor(game: Game) {
    super(game);
  }

  onApplied(target: T): void {
    for (const ability of target.abilities) {
      ability.seal();
    }
  }

  onRemoved(target: T): void {
    for (const ability of target.abilities) {
      ability.unseal();
    }
  }

  onReapplied(target: T): void {
    for (const ability of target.abilities) {
      ability.seal();
    }
  }
}
