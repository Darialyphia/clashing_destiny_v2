import { isDefined } from '@game/shared';
import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../../game/game';
import { GAME_EVENTS, type GameEventMap } from '../../game/game.events';
import type { EventMapWithStarEvent } from '../../utils/typed-emitter';
import { ModifierMixin } from '../modifier-mixin';

export class GameEventModifierMixin<
  TEvent extends keyof EventMapWithStarEvent<GameEventMap>
> extends ModifierMixin<AnyCard> {
  private occurencesThisPlayerTurn = 0;

  private occurencesThisGameTurn = 0;

  constructor(
    game: Game,
    private options: {
      eventName: TEvent;
      handler: (event: EventMapWithStarEvent<GameEventMap>[TEvent]) => void;
      filter?: (event: EventMapWithStarEvent<GameEventMap>[TEvent]) => boolean;
      frequencyPerGameTurn?: number;
    }
  ) {
    super(game);
    this.wrappedHandler = this.wrappedHandler.bind(this);
    this.onGameTurnEnd = this.onGameTurnEnd.bind(this);
  }

  get eventName() {
    return this.options.eventName;
  }

  private wrappedHandler(event: EventMapWithStarEvent<GameEventMap>[TEvent]) {
    if (this.options.filter && !this.options.filter(event)) {
      return;
    }

    if (
      isDefined(this.options.frequencyPerGameTurn) &&
      this.occurencesThisGameTurn >= this.options.frequencyPerGameTurn
    ) {
      return;
    }

    this.occurencesThisPlayerTurn++;
    this.occurencesThisGameTurn++;

    return this.options.handler(event);
  }

  private onGameTurnEnd() {
    this.occurencesThisGameTurn = 0;
  }

  onApplied(): void {
    this.game.on(this.options.eventName, this.wrappedHandler as any);

    if (isDefined(this.options.frequencyPerGameTurn)) {
      this.game.on(GAME_EVENTS.TURN_END, this.onGameTurnEnd);
    }
  }

  onRemoved(): void {
    this.game.off(this.options.eventName, this.wrappedHandler as any);

    if (isDefined(this.options.frequencyPerGameTurn)) {
      this.game.off(GAME_EVENTS.TURN_END, this.onGameTurnEnd);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onReapplied(): void {}
}
