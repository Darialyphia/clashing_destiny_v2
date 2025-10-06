import type { Doc, Id } from '../../_generated/dataModel';
import { Entity } from '../../shared/entity';
import { type UserId } from '../../users/entities/user.entity';
import { DomainError } from '../../utils/error';
import { MatchmakingUser } from '../entities/matchmakingUser.entity';
import { Matchmaking as GameMatchmaking } from '@game/engine/src/matchmaking/matchmaking';
import {
  MMRMatchmakingStrategy,
  createMMRMatchmakingOptions
} from '@game/engine/src/matchmaking/strategies/mmr.strategy';

export type MatchmakingData = {
  matchmaking: Doc<'matchmaking'>;
  matchmakingUsers: MatchmakingUser[];
};

export type MatchmakingId = Id<'matchmaking'>;
export type MatchmakingDoc = Doc<'matchmaking'>;

export class Matchmaking extends Entity<MatchmakingId, MatchmakingData> {
  isInMatchmaking(user: MatchmakingUser) {
    return this.data.matchmakingUsers.some(u => u.equals(user));
  }

  get enabled() {
    return this.data.matchmaking.enabled;
  }

  get name() {
    return this.data.matchmaking.name;
  }

  get description() {
    return this.data.matchmaking.description;
  }

  get startedAt() {
    return this.data.matchmaking.startedAt;
  }

  get nextInvocationId() {
    return this.data.matchmaking.nextInvocationId;
  }

  get participants() {
    return this.data.matchmakingUsers;
  }

  get isRunning() {
    return !!this.data.matchmaking.nextInvocationId;
  }

  canJoin(user: MatchmakingUser) {
    if (!this.enabled) return false;
    return !this.isInMatchmaking(user);
  }

  join(user: MatchmakingUser) {
    if (this.isInMatchmaking(user)) {
      throw new DomainError('User is already in the matchmaking');
    }

    this.data.matchmakingUsers.push(user);
  }

  leave(userId: UserId) {
    this.data.matchmakingUsers = this.data.matchmakingUsers.filter(
      u => u.userId !== userId
    );
  }

  matchParticipants() {
    const strategy = new MMRMatchmakingStrategy<MatchmakingUser>(
      createMMRMatchmakingOptions()
    );
    const matchmaking = new GameMatchmaking(strategy);
    this.participants.forEach(user => {
      matchmaking.join(
        {
          id: user.userId as string,
          isDemotionGame: false,
          isPromotionGame: false,
          lossStreak: 0,
          meta: user,
          mmr: user.mmr,
          recentWinrate: 0,
          winStreak: 0
        },
        user.joinedAt
      );
    });

    const { pairs, remaining } = matchmaking.makePairs();

    pairs.forEach(([a, b]) => {
      this.leave(a.id as UserId);
      this.leave(b.id as UserId);
    });
    return { pairs, remaining };
  }

  scheduleRun(nextInvocationId: Id<'_scheduled_functions'>) {
    this.data.matchmaking.nextInvocationId = nextInvocationId;
  }

  stopRunning() {
    this.data.matchmaking.nextInvocationId = undefined;
  }
}
