import type { GameEventName, GameStarEvent } from '../../game/game.events';
import type { Game } from '../../game/game';

export type TrackedEvent = GameStarEvent;

export class EventTracker {
  private eventsByGameTurn = new Map<number, TrackedEvent[]>();

  constructor(private game: Game) {
    game.on('*', event => {
      const turn = game.turnSystem.elapsedTurns;
      if (!this.eventsByGameTurn.has(turn)) {
        this.eventsByGameTurn.set(turn, []);
      }
      this.eventsByGameTurn.get(turn)?.push(event);
    });
  }

  get eventsThisGameTurn() {
    return this.eventsByGameTurn.get(this.game.turnSystem.elapsedTurns) ?? [];
  }

  getEventsOnTurn(turn: number, predicate?: (event: TrackedEvent) => boolean) {
    const events = this.eventsByGameTurn.get(turn) ?? [];
    if (!predicate) return events;
    return events.filter(predicate);
  }

  getEventsOnTurnByName<TEventName extends GameEventName>(
    turn: number,
    eventName: TEventName
  ) {
    return this.getEventsOnTurn(turn, event => event.data.eventName === eventName);
  }

  getEventsThisGameTurnByName<TEventName extends GameEventName>(eventName: TEventName) {
    return this.eventsThisGameTurn.filter(event => event.data.eventName === eventName);
  }

  getEventsSince(turn: number) {
    const events: TrackedEvent[] = [];
    for (
      let currentTurn = turn;
      currentTurn <= this.game.turnSystem.elapsedTurns;
      currentTurn++
    ) {
      const turnEvents = this.eventsByGameTurn.get(currentTurn);
      if (turnEvents) {
        events.push(...turnEvents);
      }
    }
    return events;
  }

  getEventsByName<TEventName extends GameEventName>(eventName: TEventName) {
    return this.getEventsSince(0).filter(event => event.data.eventName === eventName);
  }
}
