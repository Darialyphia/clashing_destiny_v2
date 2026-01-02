import { Game } from '../../game/game';
import type { GameEventMap } from '../../game/game.events';
import type { EventMapWithStarEvent } from '../../utils/typed-emitter';
import { ModifierMixin } from '../modifier-mixin';
import type { Modifier, ModifierTarget } from '../modifier.entity';

export class UntilEventModifierMixin<
  TEvent extends keyof EventMapWithStarEvent<GameEventMap>
> extends ModifierMixin<ModifierTarget> {
  private modifier!: Modifier<ModifierTarget>;

  constructor(
    game: Game,
    private options: {
      eventName: TEvent;
      filter?: (event: EventMapWithStarEvent<GameEventMap>[TEvent]) => boolean;
    }
  ) {
    super(game);
    this.onEvent = this.onEvent.bind(this);
  }

  private async onEvent(event: EventMapWithStarEvent<GameEventMap>[TEvent]) {
    if (this.options.filter && !this.options.filter(event)) {
      return;
    }
    console.log('UntilEventModifierMixin removing modifier', this.modifier);
    await this.modifier.remove();
  }

  onApplied(target: ModifierTarget, modifier: Modifier<ModifierTarget>): void {
    this.modifier = modifier;

    this.game.on(this.options.eventName, this.onEvent as any);
  }

  onRemoved(): void {}

  onReapplied(): void {}
}
