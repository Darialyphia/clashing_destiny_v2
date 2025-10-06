import { eventEmitter, type EventEmitter } from '../shared/eventEmitter';
import type { Scheduler } from 'convex/server';
import { PlayersPairedEvent } from '../matchmaking/events/playersPaired.event';
import { internal } from '../_generated/api';

export class GameSubscribers {
  static INJECTION_KEY = 'gameSubscribers' as const;

  constructor(private ctx: { scheduler: Scheduler; eventEmitter: EventEmitter }) {
    eventEmitter.on(PlayersPairedEvent.EVENT_NAME, this.onPlayersPaired.bind(this));
  }

  private async onPlayersPaired(event: PlayersPairedEvent) {
    await Promise.all(
      event.pairs.map(async ([participantA, participantB]) => {
        await this.ctx.scheduler.runAfter(0, internal.games.setupRankedGame, {
          pair: [
            {
              userId: participantA.meta.userId,
              deckId: participantA.meta.deckId
            },
            {
              userId: participantB.meta.userId,
              deckId: participantB.meta.deckId
            }
          ]
        });
      })
    );
  }
}
