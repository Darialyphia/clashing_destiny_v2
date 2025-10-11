import { ensureAuthenticated } from '../../auth/auth.utils';
import type { AuthSession } from '../../auth/entities/session.entity';
import type { UseCase } from '../../usecase';
import { AppError } from '../../utils/error';
import type { Id } from '../../_generated/dataModel';
import type { LobbyRepository } from '../repositories/lobby.repository';
import type { LobbyUserRepository } from '../repositories/lobbyUser.repository';

export type LeaveLobbyInput = {
  lobbyId: Id<'lobbies'>;
};

export type LeaveLobbyOutput = {
  success: boolean;
};

export class LeaveLobbyUseCase implements UseCase<LeaveLobbyInput, LeaveLobbyOutput> {
  static INJECTION_KEY = 'leaveLobbyUseCase' as const;

  constructor(
    private ctx: {
      lobbyRepo: LobbyRepository;
      lobbyUserRepo: LobbyUserRepository;
      session: AuthSession | null;
    }
  ) {}

  async execute(input: LeaveLobbyInput): Promise<LeaveLobbyOutput> {
    const session = ensureAuthenticated(this.ctx.session);

    const lobby = await this.ctx.lobbyRepo.getById(input.lobbyId);
    if (!lobby) {
      throw new AppError('Lobby not found');
    }

    const lobbyUser = await this.ctx.lobbyUserRepo.getByLobbyAndUser(
      input.lobbyId,
      session.userId
    );
    if (!lobbyUser) {
      throw new AppError('You are not in this lobby');
    }

    const isOwner = lobby.isOwner(session.userId);

    if (isOwner) {
      await this.ctx.lobbyUserRepo.deleteByLobbyId(input.lobbyId);
      await this.ctx.lobbyRepo.delete(input.lobbyId);
    } else {
      await this.ctx.lobbyUserRepo.delete(lobbyUser.id);
    }

    return {
      success: true
    };
  }
}
