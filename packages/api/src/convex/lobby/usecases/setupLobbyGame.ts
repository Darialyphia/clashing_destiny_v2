import type { Id } from '../../_generated/dataModel';
import type { DeckId } from '../../deck/entities/deck.entity';
import type { GameRepository } from '../../game/repositories/game.repository';
import type { UseCase } from '../../usecase';
import type { UserId } from '../../users/entities/user.entity';
import { AppError } from '../../utils/error';
import { LOBBY_USER_ROLES } from '../lobby.constants';
import type { LobbyRepository } from '../repositories/lobby.repository';
import type { LobbyUserRepository } from '../repositories/lobbyUser.repository';

export type SetupLobbyGameInput = {
  lobbyId: Id<'lobbies'>;
};

export type SetupLobbyGameOutput = { success: boolean };

export class SetupLobbyGameUseCase
  implements UseCase<SetupLobbyGameInput, SetupLobbyGameOutput>
{
  static INJECTION_KEY = 'setupLobbyGameUseCase' as const;

  constructor(
    private ctx: {
      gameRepo: GameRepository;
      lobbyRepo: LobbyRepository;
      lobbyUserRepo: LobbyUserRepository;
    }
  ) {}

  async execute(input: SetupLobbyGameInput) {
    const lobby = await this.ctx.lobbyRepo.getById(input.lobbyId);
    if (!lobby) {
      throw new AppError('Lobby not found');
    }

    if (!lobby.isCreatingGame) {
      throw new AppError('Cannot create lobby game in this status');
    }

    const lobbyUsers = await this.ctx.lobbyUserRepo.getByLobbyId(input.lobbyId);
    const players = lobbyUsers.filter(user => user.role === LOBBY_USER_ROLES.PLAYER);
    const game = await this.ctx.gameRepo.create(
      players.map(player => ({
        userId: player.userId,
        deckId: player.deckId!
      })),
      lobby.options
    );

    lobby.setGameStarted(game.id);
    await this.ctx.lobbyRepo.save(lobby);

    return { success: true };
  }
}
