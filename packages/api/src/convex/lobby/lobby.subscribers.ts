import { eventEmitter, type EventEmitter } from '../shared/eventEmitter';
import type { Scheduler } from 'convex/server';
import { internal } from '../_generated/api';
import { GameEndedEvent } from '../game/events/gameEnded.event';
import type { DatabaseWriter } from '../_generated/server';
import { LobbyGameStartedEvent } from './events/lobbyGameStarted.event';
import { PlayersPairedEvent } from '../matchmaking/events/playersPaired.event';

export class LobbySubscribers {
  static INJECTION_KEY = 'lobbySubscribers' as const;

  constructor(
    private ctx: { scheduler: Scheduler; eventEmitter: EventEmitter; db: DatabaseWriter }
  ) {
    eventEmitter.on(GameEndedEvent.EVENT_NAME, this.onGameEnded.bind(this));
    eventEmitter.on(LobbyGameStartedEvent.EVENT_NAME, this.onLobbyGameStarted.bind(this));
    eventEmitter.on(PlayersPairedEvent.EVENT_NAME, this.onPlayersPaired.bind(this));
  }

  private async onLobbyGameStarted(event: LobbyGameStartedEvent) {
    await this.ctx.scheduler.runAfter(0, internal.lobbies.setupLobbyGame, {
      lobbyId: event.lobbyId
    });
  }

  private async onGameEnded(event: GameEndedEvent) {
    const lobby = await this.ctx.db
      .query('lobbies')
      .withIndex('by_game_id', q => q.eq('gameId', event.gameId))
      .unique();
    if (!lobby) return;

    await this.ctx.scheduler.runAfter(0, internal.lobbies.destroy, {
      lobbyId: lobby._id
    });
  }

  private async onPlayersPaired(event: PlayersPairedEvent) {
    await Promise.all(
      event.pairs.flatMap(pair =>
        pair.map(async participant =>
          this.ctx.scheduler.runAfter(0, internal.lobbies.kick, {
            userId: participant.meta.userId
          })
        )
      )
    );
  }
}
