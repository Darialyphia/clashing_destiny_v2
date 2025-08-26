import type { Doc, Id } from '../../_generated/dataModel';
import { Entity } from '../../shared/entity';
import { User } from '../../users/entities/user.entity';

export type MatchmakingUserDoc = Doc<'matchmakingUsers'>;

export class MatchmakingUser extends Entity<
  Id<'matchmakingUsers'>,
  MatchmakingUserDoc & { user: User }
> {
  get userId() {
    return this.data.userId;
  }

  get matchmakingId() {
    return this.data.matchmakingId;
  }
}
