import { AppError } from '../../utils/error';
import type { LobbyId } from '../entities/lobby.entity';
import type { LobbyRepository } from '../repositories/lobby.repository';

export type UpdateLobbyOptionsInput = {
  lobbyId: LobbyId;
  options: {
    disableTurnTimers: boolean;
    teachingMode: boolean;
  };
};

export type UpdateLobbyOptionsOutput = {
  success: boolean;
};

export class UpdateLobbyOptionsUseCase {
  static INJECTION_KEY = 'updateLobbyOptionsUseCase' as const;

  constructor(private ctx: { lobbyRepo: LobbyRepository }) {}

  async execute(input: UpdateLobbyOptionsInput): Promise<UpdateLobbyOptionsOutput> {
    const lobby = await this.ctx.lobbyRepo.getById(input.lobbyId);
    if (!lobby) {
      throw new AppError('Lobby not found');
    }

    lobby.updateOptions(input.options);
    await this.ctx.lobbyRepo.save(lobby);

    return { success: true };
  }
}
