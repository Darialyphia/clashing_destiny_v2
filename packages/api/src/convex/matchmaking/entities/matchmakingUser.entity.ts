import type { Doc, Id } from '../../_generated/dataModel';
import { Entity } from '../../shared/entity';

export type MatchmakingUserDoc = Doc<'matchmakingUsers'>;
export type MatchmakingUserId = Id<'matchmakingUsers'>;
export class MatchmakingUser extends Entity<
  Id<'matchmakingUsers'>,
  MatchmakingUserDoc & { mmr: number }
> {
  get userId() {
    return this.data.userId;
  }

  get deckId() {
    return this.data.deckId;
  }

  get matchmakingId() {
    return this.data.matchmakingId;
  }

  get joinedAt() {
    return this.data.joinedAt;
  }

  get mmr() {
    return this.data.mmr;
  }
}
