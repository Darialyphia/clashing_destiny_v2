import type { Doc, Id } from '../../_generated/dataModel';
import { Entity } from '../../shared/entity';
import { UserId } from '../../users/entities/user.entity';
import { DomainError } from '../../utils/error';
import { MatchmakingUser } from '../entities/matchmakingUser.entity';

export type MatchmakingData = {
  matchmaking: Doc<'matchmaking'>;
  matchmakingUsers: MatchmakingUser[];
};

export type MatchmakingId = Id<'matchmaking'>;
export type MatchmakingDoc = Doc<'matchmaking'>;
export class Matchmaking extends Entity<MatchmakingId, MatchmakingData> {
  private has(user: MatchmakingUser) {
    return this.data.matchmakingUsers.some(u => u.equals(user));
  }

  get name() {
    return this.data.matchmaking.name;
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

  canJoin(user: MatchmakingUser) {
    return !this.has(user);
  }

  join(user: MatchmakingUser) {
    if (this.has(user)) {
      throw new DomainError('User is already in the matchmaking');
    }

    this.data.matchmakingUsers.push(user);
  }

  leave(userId: UserId) {
    this.data.matchmakingUsers = this.data.matchmakingUsers.filter(
      u => u.userId !== userId
    );
  }
}
