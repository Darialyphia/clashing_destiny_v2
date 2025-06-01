import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../../game/game';
import type { GameEventMap } from '../../game/game.events';
import type { EventMapWithStarEvent } from '../../utils/typed-emitter';
import { ModifierMixin } from '../modifier-mixin';

export class GameEventModifierMixin<
  TEvent extends keyof EventMapWithStarEvent<GameEventMap>
> extends ModifierMixin<AnyCard> {
  constructor(
    game: Game,
    private options: {
      eventName: TEvent;
      handler: (event: EventMapWithStarEvent<GameEventMap>[TEvent]) => void;
      once?: boolean;
    }
  ) {
    super(game);
  }

  onApplied(): void {
    if (this.options.once) {
      this.game.once(this.options.eventName, this.options.handler as any);
    } else {
      this.game.on(this.options.eventName, this.options.handler as any);
    }
  }

  onRemoved(): void {
    this.game.off(this.options.eventName, this.options.handler as any);
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onReapplied(): void {}
}
