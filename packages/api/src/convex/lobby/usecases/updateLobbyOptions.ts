import { ensureAuthenticated } from '../../auth/auth.utils';
import type { AuthSession } from '../../auth/entities/session.entity';
import type { UseCase } from '../../usecase';
import type { LobbyId } from '../entities/lobby.entity';
import type { LobbyRepository } from '../repositories/lobby.repository';

export type UpdateLobbyOptionsInput = {
  lobbyId: LobbyId;
  options: {
    disableTurnTimers: boolean;
    teachingMode: boolean;
  };
};

export type UpdateLobbyOptionsOutput = { success: boolean };

export class UpdateLobbyOptionsUseCase
  implements UseCase<UpdateLobbyOptionsInput, UpdateLobbyOptionsOutput>
{
  static INJECTION_KEY = 'updateLobbyOptionsUseCase' as const;

  constructor(private ctx: { lobbyRepo: LobbyRepository; session: AuthSession | null }) {}

  async execute(input: UpdateLobbyOptionsInput): Promise<UpdateLobbyOptionsOutput> {
    const session = ensureAuthenticated(this.ctx.session);

    const { lobbyId, options } = input;
    const lobby = await this.ctx.lobbyRepo.getById(lobbyId);
    if (!lobby) {
      throw new Error('Lobby not found');
    }

    if (!lobby.isOwner(session.userId)) {
      throw new Error('Only the lobby owner can update lobby options');
    }

    lobby.updateOptions(options);

    await this.ctx.lobbyRepo.save(lobby);

    return { success: true };
  }
}
