import type { Scheduler } from 'convex/server';
import { LobbyGameStartedEvent } from '../lobby/events/lobbyGameStarted.event';
import type { EventEmitter } from '../shared/eventEmitter';
import type { LobbyUserRepository } from '../lobby/repositories/lobbyUser.repository';
import { internal } from '../_generated/api';

export class MatchmakingSubscribers {
  static INJECTION_KEY = 'matchmakingSubscribers' as const;

  constructor(
    private ctx: {
      eventEmitter: EventEmitter;
      scheduler: Scheduler;
      lobbyUserRepo: LobbyUserRepository;
    }
  ) {
    ctx.eventEmitter.on(
      LobbyGameStartedEvent.EVENT_NAME,
      this.onLobbyGameStarted.bind(this)
    );
  }

  private async onLobbyGameStarted(event: LobbyGameStartedEvent) {
    const lobbyUsers = await this.ctx.lobbyUserRepo.getByLobbyId(event.lobbyId);

    await Promise.all(
      lobbyUsers.map(async lobbyUser => {
        await this.ctx.scheduler.runAfter(0, internal.matchmaking.kick, {
          userId: lobbyUser.userId
        });
      })
    );
  }
}
