import type { LobbyId } from '../entities/lobby.entity';
import type { LobbyStatus } from '../lobby.constants';
import type { LobbyUserId } from '../entities/lobbyUser.entity';
import type { DeckId } from '../../deck/entities/deck.entity';
import type { UseCase } from '../../usecase';
import { AppError } from '../../utils/error';
import type { LobbyReadRepository } from '../repositories/lobby.repository';
import type { LobbyUserReadRepository } from '../repositories/lobbyUser.repository';
import type { UserReadRepository } from '../../users/repositories/user.repository';
import type { GameId } from '../../game/entities/game.entity';
import type { UserId } from '../../users/entities/user.entity';

export type GetLobbyByIdInput = {
  lobbyId: LobbyId;
};

export type GetLobbyByIdOutput = {
  id: LobbyId;
  name: string;
  needsPassword: boolean;
  ownerId: string;
  status: LobbyStatus;
  gameId: GameId | null;
  players: Array<{
    id: LobbyUserId;
    userId: UserId;
    username: string;
    deckId?: DeckId;
  }>;
  spectators: Array<{
    id: LobbyUserId;
    userId: UserId;
    username: string;
  }>;
  options: {
    disableTurnTimers: boolean;
    teachingMode: boolean;
  };
};

export class GetLobbyByIdUseCase
  implements UseCase<GetLobbyByIdInput, GetLobbyByIdOutput>
{
  static INJECTION_KEY = 'getLobbyByIdUseCase' as const;

  constructor(
    private ctx: {
      lobbyReadRepo: LobbyReadRepository;
      lobbyUserReadRepo: LobbyUserReadRepository;
      userReadRepo: UserReadRepository;
    }
  ) {}

  async execute(input: GetLobbyByIdInput): Promise<GetLobbyByIdOutput> {
    const lobby = await this.ctx.lobbyReadRepo.getById(input.lobbyId);
    if (!lobby) {
      throw new AppError('Lobby not found');
    }

    const players = await this.ctx.lobbyUserReadRepo.getPlayersByLobbyId(input.lobbyId);
    const spectators = await this.ctx.lobbyUserReadRepo.getSpectatorsByLobbyId(
      input.lobbyId
    );

    // Get usernames for players
    const playersWithUsernames = await Promise.all(
      players.map(async player => {
        const user = await this.ctx.userReadRepo.getById(player.userId);
        return {
          id: player._id,
          userId: player.userId,
          username: user?.username || 'Unknown User',
          deckId: player.deckId
        };
      })
    );

    const spectatorsWithUsernames = await Promise.all(
      spectators.map(async spectator => {
        const user = await this.ctx.userReadRepo.getById(spectator.userId);
        return {
          id: spectator._id,
          userId: spectator.userId,
          username: user?.username || 'Unknown User'
        };
      })
    );

    return {
      id: lobby._id,
      name: lobby.name,
      needsPassword: !!lobby.password,
      ownerId: lobby.ownerId,
      gameId: lobby.gameId ?? null,
      status: lobby.status,
      players: playersWithUsernames,
      spectators: spectatorsWithUsernames,
      options: lobby.options
    };
  }
}
