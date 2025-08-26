import type { Id } from '../../_generated/dataModel';
import { DomainError } from '../../utils/error';
import { Matchmaking as GameMatchmaking } from '@game/engine/src/matchmaking/matchmaking';
import {
  createMMRMatchmakingOptions,
  MMRMatchmakingParticipant,
  MMRMatchmakingStrategy
} from '@game/engine/src/matchmaking/strategies/mmr.strategy';
import { MatchmakingUser } from './matchmakingUser.entity';

type MatchmakingData = {
  id: Id<'matchmaking'>;
  name: string;
  startedAt: number;
  nextInvocationId?: Id<'_scheduled_functions'>;
};

export class Matchmaking {
  private data: MatchmakingData;

  private _participants: MatchmakingUser[];

  private mm: GameMatchmaking<MMRMatchmakingParticipant>;

  constructor(config: { data: MatchmakingData; participants: MatchmakingUser[] }) {
    this.data = config.data;
    this._participants = config.participants || [];

    this.mm = new GameMatchmaking(
      new MMRMatchmakingStrategy(createMMRMatchmakingOptions())
    );

    // this.participants.forEach(participant => {
    //   this.mm.join({
    //     id: participant.userId,
    //     // @FIXME this is dummy data for the moment, we need to fix the MatchmakingUser aggregate problem
    //     mmr: 1200,
    //     // @TODO this is dummy data for the moment, game history persistence and ranking has not been implemented yet
    //     isDemotionGame: false,
    //     isPromotionGame: false,
    //     lossStreak: 0,
    //     tolerance: 50,
    //     winStreak: 0,
    //     recentWinrate: 0
    //   });
    // });
  }

  get id() {
    return this.data.id;
  }

  get name() {
    return this.data.name;
  }

  get startedAt() {
    return this.data.startedAt;
  }

  get nextInvocationId() {
    return this.data.nextInvocationId;
  }

  equals(other: Matchmaking): boolean {
    return this.id === other.id;
  }

  get participants(): readonly MatchmakingUser[] {
    return [...this._participants];
  }

  canJoin(userId: Id<'users'>): boolean {
    return !this._participants.some(participant => participant.userId === userId);
  }

  canLeave(userId: Id<'users'>): boolean {
    return this._participants.some(participant => participant.userId === userId);
  }

  join(user: MatchmakingUser) {
    if (!this.canJoin(user.userId)) {
      throw new DomainError('User is already participating in this matchmaking');
    }

    this._participants.push(user);
  }

  leave(userId: Id<'users'>): MatchmakingUser {
    if (!this.canLeave(userId)) {
      throw new DomainError('User is not participating in this matchmaking');
    }

    const participantIndex = this._participants.findIndex(
      participant => participant.userId === userId
    );

    const removedParticipant = this._participants.splice(participantIndex, 1)[0];

    return removedParticipant;
  }

  get isEmpty(): boolean {
    return this._participants.length === 0;
  }

  hasParticipant(userId: Id<'users'>): boolean {
    return this._participants.some(participant => participant.userId === userId);
  }
}
