import { Id } from '../../_generated/dataModel';
import { DomainError } from '../../utils/error';

export class MatchmakingUser {
  public readonly userId: Id<'users'>;
  public readonly matchmakingId: Id<'matchmaking'>;
  public readonly id?: Id<'matchmakingUsers'>;

  constructor(config: {
    userId: Id<'users'>;
    matchmakingId: Id<'matchmaking'>;
    id?: Id<'matchmakingUsers'>;
  }) {
    this.userId = config.userId;
    this.matchmakingId = config.matchmakingId;
    this.id = config.id;
  }
}

export class Matchmaking {
  public readonly id: Id<'matchmaking'>;
  public readonly name: string;
  public readonly startedAt: number;
  public readonly nextInvocationId?: Id<'_scheduled_functions'>;
  private participants: MatchmakingUser[];

  constructor(config: {
    id: Id<'matchmaking'>;
    name: string;
    startedAt: number;
    participants?: MatchmakingUser[];
    nextInvocationId?: Id<'_scheduled_functions'>;
  }) {
    this.id = config.id;
    this.name = config.name;
    this.startedAt = config.startedAt;
    this.participants = config.participants || [];
    this.nextInvocationId = config.nextInvocationId;
  }

  getParticipants(): readonly MatchmakingUser[] {
    return [...this.participants];
  }

  canJoin(userId: Id<'users'>): boolean {
    return !this.participants.some(participant => participant.userId === userId);
  }

  canLeave(userId: Id<'users'>): boolean {
    return this.participants.some(participant => participant.userId === userId);
  }

  join(userId: Id<'users'>): MatchmakingUser {
    if (!this.canJoin(userId)) {
      throw new DomainError('User is already participating in this matchmaking');
    }

    const matchmakingUser = new MatchmakingUser({
      userId,
      matchmakingId: this.id
    });

    this.participants.push(matchmakingUser);
    return matchmakingUser;
  }

  leave(userId: Id<'users'>): MatchmakingUser {
    if (!this.canLeave(userId)) {
      throw new DomainError('User is not participating in this matchmaking');
    }

    const participantIndex = this.participants.findIndex(
      participant => participant.userId === userId
    );

    const removedParticipant = this.participants.splice(participantIndex, 1)[0];
    return removedParticipant;
  }

  getParticipantCount(): number {
    return this.participants.length;
  }

  isEmpty(): boolean {
    return this.participants.length === 0;
  }

  hasParticipant(userId: Id<'users'>): boolean {
    return this.participants.some(participant => participant.userId === userId);
  }
}
