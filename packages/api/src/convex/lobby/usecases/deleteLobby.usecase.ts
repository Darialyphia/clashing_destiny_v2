import type { UseCase } from '../../usecase';
import { AppError, DomainError } from '../../utils/error';
import type { LobbyId } from '../entities/lobby.entity';
import type { LobbyRepository } from '../repositories/lobby.repository';

export type DeleteLobbyInput = {
  lobbyId: LobbyId;
};

export type DeleteLobbyOutput = {
  success: boolean;
};

export class DeleteLobbyUseCase implements UseCase<DeleteLobbyInput, DeleteLobbyOutput> {
  static INJECTION_KEY = 'deleteLobbyUseCase' as const;

  constructor(private ctx: { lobbyRepo: LobbyRepository }) {}

  async execute(input: DeleteLobbyInput): Promise<DeleteLobbyOutput> {
    const lobby = await this.ctx.lobbyRepo.getById(input.lobbyId);
    if (!lobby) {
      throw new AppError('Lobby not found');
    }

    await this.ctx.lobbyRepo.delete(input.lobbyId);

    return { success: true };
  }
}
