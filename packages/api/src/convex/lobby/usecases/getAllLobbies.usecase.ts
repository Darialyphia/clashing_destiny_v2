import type { UserId } from 'lucia';
import type { LobbyId } from '../entities/lobby.entity';
import type { UseCase } from '../../usecase';
import type { LobbyReadRepository } from '../repositories/lobby.repository';
import type { LobbyUserReadRepository } from '../repositories/lobbyUser.repository';
import type { UserReadRepository } from '../../users/repositories/user.repository';
import type { LobbyStatus } from '../lobby.constants';

export type GetAllLobbiesInput = never;

export type GetAllLobbiesOutput = Array<{
  id: LobbyId;
  name: string;
  status: LobbyStatus;
  needsPassword: boolean;
  ownerId: UserId;
  ownerName: string;
  playerCount: number;
}>;

export class GetAllLobbiesUseCase
  implements UseCase<GetAllLobbiesInput, GetAllLobbiesOutput>
{
  static INJECTION_KEY = 'getAllLobbiesUseCase' as const;

  constructor(
    private ctx: {
      lobbyReadRepo: LobbyReadRepository;
      lobbyUserReadRepo: LobbyUserReadRepository;
      userReadRepo: UserReadRepository;
    }
  ) {}

  async execute(): Promise<GetAllLobbiesOutput> {
    const lobbies = await this.ctx.lobbyReadRepo.getAll();

    const lobbiesWithDetails = await Promise.all(
      lobbies.map(async lobby => {
        const owner = await this.ctx.userReadRepo.getById(lobby.ownerId);

        const players = await this.ctx.lobbyUserReadRepo.getPlayersByLobbyId(lobby._id);

        return {
          id: lobby._id,
          name: lobby.name,
          status: lobby.status,
          needsPassword: !!lobby.password,
          ownerId: lobby.ownerId,
          ownerName: owner?.username || 'Unknown User',
          playerCount: players.length
        };
      })
    );

    return lobbiesWithDetails;
  }
}
