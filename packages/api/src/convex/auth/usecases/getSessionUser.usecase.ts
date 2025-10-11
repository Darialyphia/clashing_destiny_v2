import type { Nullable } from '@game/shared';
import type { MatchmakingId } from '../../matchmaking/entities/matchmaking.entity';
import type { UseCase } from '../../usecase';
import type { UserId } from '../../users/entities/user.entity';
import { Email } from '../../utils/email';
import { AppError } from '../../utils/error';
import { Password } from '../../utils/password';
import type { AuthSession, SessionId } from '../entities/session.entity';
import type { MatchmakingUserReadRepository } from '../../matchmaking/repositories/matchmakingUser.repository';
import type { UserReadRepository } from '../../users/repositories/user.repository';
import type { MatchmakingReadRepository } from '../../matchmaking/repositories/matchmaking.repository';
import type { GameStatus } from '../../game/game.constants';
import type { GameId } from '../../game/entities/game.entity';
import type { GameReadRepository } from '../../game/repositories/game.repository';
import type { LobbyId } from '../../lobby/entities/lobby.entity';
import type { LobbyReadRepository } from '../../lobby/repositories/lobby.repository';

export interface LoginInput {
  email: Email;
  password: Password;
}

export interface GetSessionUserput {
  sessionId: SessionId;
  id: UserId;
  username: string;
  mmr: number;
  currentJoinedMatchmaking: Nullable<{
    id: MatchmakingId;
    name: string;
    joinedAt: number;
  }>;
  currentGame: Nullable<{
    id: GameId;
    status: GameStatus;
    options: { teachingMode: boolean };
  }>;
  currentLobby: Nullable<{ id: LobbyId; name: string }>;
}

export class GetSessionUserUseCase implements UseCase<never, GetSessionUserput> {
  static INJECTION_KEY = 'getSessionUserUseCase' as const;

  constructor(
    protected ctx: {
      userReadRepo: UserReadRepository;
      matchmakingUserReadRepo: MatchmakingUserReadRepository;
      matchmakingReadRepo: MatchmakingReadRepository;
      session: AuthSession | null;
      gameReadRepo: GameReadRepository;
      lobbyReadRepo: LobbyReadRepository;
    }
  ) {}

  async execute() {
    const user = await this.ctx.userReadRepo.getById(this.ctx.session!.userId);
    if (!user) throw new AppError('User not found');

    const matchmakingUser = await this.ctx.matchmakingUserReadRepo.getByUserId(user._id);
    const matchmaking = matchmakingUser
      ? await this.ctx.matchmakingReadRepo.getById(matchmakingUser.matchmakingId!)
      : null;

    const currentGame = await this.ctx.gameReadRepo.getByUserId(user._id);

    const currentLobby = await this.ctx.lobbyReadRepo.getByUserId(user._id);
    return {
      sessionId: this.ctx.session!._id,
      id: user._id,
      username: user.username,
      mmr: user.mmr,
      currentJoinedMatchmaking: matchmaking
        ? {
            id: matchmaking._id,
            name: matchmaking!.name,
            joinedAt: matchmakingUser!.joinedAt
          }
        : null,
      currentGame: currentGame
        ? {
            id: currentGame._id,
            status: currentGame.status,
            options: {
              teachingMode: currentGame.options.teachingMode
            }
          }
        : null,
      currentLobby: currentLobby
        ? { id: currentLobby._id, name: currentLobby.name }
        : null
    };
  }
}
