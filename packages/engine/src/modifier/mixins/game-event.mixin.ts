import { isDefined, type Nullable } from '@game/shared';
import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../../game/game';
import { GAME_EVENTS, type GameEventMap } from '../../game/game.events';
import type { EventMapWithStarEvent } from '../../utils/typed-emitter';
import { ModifierMixin } from '../modifier-mixin';
import type { Modifier, ModifierTarget } from '../modifier.entity';

export class GameEventModifierMixin<
  TEvent extends keyof EventMapWithStarEvent<GameEventMap>,
  TCard extends ModifierTarget
> extends ModifierMixin<TCard> {
  private occurencesThisGameTurn = 0;
  private modifier!: Modifier<TCard>;

  constructor(
    game: Game,
    private options: {
      eventName: TEvent;
      handler: (
        event: Nullable<EventMapWithStarEvent<GameEventMap>[TEvent]>,
        modifier: Modifier<TCard>
      ) => void;
      filter?: (
        event: Nullable<EventMapWithStarEvent<GameEventMap>[TEvent]>,
        modifier: Modifier<TCard>
      ) => boolean;
      frequencyPerGameTurn?: number;
      persistWhileDisabled?: boolean;
    }
  ) {
    super(game);
    this.wrappedHandler = this.wrappedHandler.bind(this);
    this.onGameTurnEnd = this.onGameTurnEnd.bind(this);
  }

  triggerManually() {
    return this.options.handler(null, this.modifier);
  }

  get eventName() {
    return this.options.eventName;
  }

  private wrappedHandler(event: EventMapWithStarEvent<GameEventMap>[TEvent]) {
    if (this.options.filter && !this.options.filter(event, this.modifier)) {
      return;
    }

    if (
      isDefined(this.options.frequencyPerGameTurn) &&
      this.occurencesThisGameTurn >= this.options.frequencyPerGameTurn
    ) {
      return;
    }

    this.occurencesThisGameTurn++;

    return this.options.handler(event, this.modifier);
  }

  private onGameTurnEnd() {
    this.occurencesThisGameTurn = 0;
  }

  onApplied(target: TCard, modifier: Modifier<TCard>): void {
    this.modifier = modifier;
    this.game.on(this.options.eventName, this.wrappedHandler as any);

    if (isDefined(this.options.frequencyPerGameTurn)) {
      this.game.on(GAME_EVENTS.TURN_END, this.onGameTurnEnd);
    }
  }

  onRemoved(): void {
    if (this.modifier.isApplied && this.options.persistWhileDisabled) return;

    this.game.off(this.options.eventName, this.wrappedHandler as any);

    if (isDefined(this.options.frequencyPerGameTurn)) {
      this.game.off(GAME_EVENTS.TURN_END, this.onGameTurnEnd);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onReapplied(): void {}
}
