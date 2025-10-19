import type { AnyFunction } from '@game/shared';
import type { HeroCard } from '../../card/entities/hero.entity';
import type { MinionCard } from '../../card/entities/minion.entity';
import type { Game } from '../../game/game';
import { ModifierMixin } from '../modifier-mixin';

export class FreezeModifierMixin<
  T extends MinionCard | HeroCard
> extends ModifierMixin<T> {
  private duration = 1;

  constructor(game: Game) {
    super(game);
    this.interceptor = this.interceptor.bind(this);
  }

  interceptor() {
    return false;
  }

  async onApplied(target: T): Promise<void> {
    await target.exhaust();
    // @ts-expect-error
    target.addInterceptor('shouldWakeUpAtTurnStart', this.interceptor);
  }

  onRemoved(target: T): void {
    // @ts-expect-error
    target.removeInterceptor('shouldWakeUpAtTurnStart', this.interceptor);
  }

  async onReapplied() {}
}
