import { Id } from '../../_generated/dataModel';

type MatchmakingUserData = {
  userId: Id<'users'>;
  matchmakingId: Id<'matchmaking'>;
  id: Id<'matchmakingUsers'>;
  mmr: number;
};

export class MatchmakingUser {
  private data: MatchmakingUserData;

  constructor(data: MatchmakingUserData) {
    this.data = data;
  }

  get id() {
    return this.data.id;
  }

  get userId() {
    return this.data.userId;
  }

  get matchmakingId() {
    return this.data.matchmakingId;
  }

  get mmr() {
    return this.data.mmr;
  }
}
