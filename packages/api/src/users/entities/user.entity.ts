import type { Id } from '../../_generated/dataModel';
import { DomainError } from '../../utils/error';
import {
  Matchmaking,
  MatchmakingUser
} from '../../matchmaking/entities/matchmaking.entity';

export class User {
  public readonly id: Id<'users'>;

  public readonly name: string;

  public readonly discriminator: string;

  public readonly passwordHash: string;

  public readonly mmr: number;

  private currentMatchmakingUser?: MatchmakingUser;

  private loadingState: {
    currentMatchmakingUser: boolean;
  };

  constructor(config: {
    id: Id<'users'>;
    name: string;
    discriminator: string;
    passwordHash: string;
    mmr: number;
    currentMatchmakingUser?: MatchmakingUser;
  }) {
    this.id = config.id;
    this.name = config.name;
    this.discriminator = config.discriminator;
    this.currentMatchmakingUser = config.currentMatchmakingUser;
    this.passwordHash = config.passwordHash;
    this.mmr = config.mmr;
    this.loadingState = {
      currentMatchmakingUser: config.currentMatchmakingUser !== undefined
    };
  }

  getCurrentMatchmaking(): MatchmakingUser | null {
    if (!this.loadingState.currentMatchmakingUser) {
      throw new DomainError(
        'Current matchmaking not loaded. Include currentMatchmaking in query.'
      );
    }
    return this.currentMatchmakingUser ?? null;
  }

  canJoinMatchmaking(matchmaking: Matchmaking): boolean {
    if (!this.loadingState.currentMatchmakingUser) {
      throw new DomainError('Cannot validate join without current matchmaking loaded');
    }
    return (
      !this.currentMatchmakingUser ||
      this.currentMatchmakingUser.matchmakingId !== matchmaking.id
    );
  }

  canLeaveMatchmaking(): boolean {
    if (!this.loadingState.currentMatchmakingUser) {
      throw new DomainError('Cannot validate leave without current matchmaking loaded');
    }
    return this.currentMatchmakingUser !== undefined;
  }

  isInMatchmaking(): boolean {
    if (!this.loadingState.currentMatchmakingUser) {
      throw new DomainError(
        'Cannot check matchmaking status without current matchmaking loaded'
      );
    }
    return this.currentMatchmakingUser !== undefined;
  }

  isInSpecificMatchmaking(matchmakingId: Id<'matchmaking'>): boolean {
    if (!this.loadingState.currentMatchmakingUser) {
      throw new DomainError(
        'Cannot check specific matchmaking without current matchmaking loaded'
      );
    }
    return this.currentMatchmakingUser?.matchmakingId === matchmakingId;
  }
}
