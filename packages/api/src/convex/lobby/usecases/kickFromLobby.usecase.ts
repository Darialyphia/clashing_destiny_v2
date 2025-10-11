import type { UserId } from '../../users/entities/user.entity';
import type { LobbyId } from '../entities/lobby.entity';
import type { LobbyRepository } from '../repositories/lobby.repository';
import type { LobbyUserRepository } from '../repositories/lobbyUser.repository';

export type KickFromLobbyInput = {
  userId: UserId;
};

export type KickFromLobbyOutput = {
  success: boolean;
};

export class KickFromLobbyUseCase {
  static INJECTION_KEY = 'kickFromLobbyUseCase' as const;

  constructor(
    private ctx: { lobbyUserRepo: LobbyUserRepository; lobbyRepo: LobbyRepository }
  ) {}

  async execute(input: KickFromLobbyInput): Promise<KickFromLobbyOutput> {
    const lobbyUser = await this.ctx.lobbyUserRepo.getByUserId(input.userId);
    if (!lobbyUser) return { success: true };

    const lobby = await this.ctx.lobbyRepo.getById(lobbyUser[0].lobbyId);
    if (!lobby) return { success: true };

    const isOwner = lobby.isOwner(input.userId);

    if (isOwner) {
      await this.ctx.lobbyUserRepo.deleteByLobbyId(lobby.id);
      await this.ctx.lobbyRepo.delete(lobby.id);
    } else {
      await this.ctx.lobbyUserRepo.delete(lobbyUser[0].id);
    }

    return { success: true };
  }
}
