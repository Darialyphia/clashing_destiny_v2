import { ensureAuthenticated } from '../../auth/auth.utils';
import type { AuthSession } from '../../auth/entities/session.entity';
import type { UseCase } from '../../usecase';
import { AppError } from '../../utils/error';
import type { Id } from '../../_generated/dataModel';
import type { UserId } from '../../users/entities/user.entity';
import {
  LOBBY_USER_ROLES,
  MAX_PLAYERS_PER_LOBBY,
  type LobbyUserRole
} from '../lobby.constants';
import type { LobbyRepository } from '../repositories/lobby.repository';
import type {
  LobbyUserReadRepository,
  LobbyUserRepository
} from '../repositories/lobbyUser.repository';

export type ChangeLobbyUserRoleInput = {
  lobbyId: Id<'lobbies'>;
  targetUserId: UserId;
  newRole: LobbyUserRole;
};

export type ChangeLobbyUserRoleOutput = {
  success: boolean;
};

export class ChangeLobbyUserRoleUseCase
  implements UseCase<ChangeLobbyUserRoleInput, ChangeLobbyUserRoleOutput>
{
  static INJECTION_KEY = 'changeLobbyUserRoleUseCase' as const;

  constructor(
    private ctx: {
      lobbyRepo: LobbyRepository;
      lobbyUserRepo: LobbyUserRepository;
      session: AuthSession | null;
    }
  ) {}

  async execute(input: ChangeLobbyUserRoleInput): Promise<ChangeLobbyUserRoleOutput> {
    const session = ensureAuthenticated(this.ctx.session);

    const lobby = await this.ctx.lobbyRepo.getById(input.lobbyId);
    if (!lobby) {
      throw new AppError('Lobby not found');
    }

    const targetLobbyUser = await this.ctx.lobbyUserRepo.getByLobbyAndUser(
      input.lobbyId,
      input.targetUserId
    );
    if (!targetLobbyUser) {
      throw new AppError('Target user is not in this lobby');
    }

    const requestingLobbyUser = await this.ctx.lobbyUserRepo.getByLobbyAndUser(
      input.lobbyId,
      session.userId
    );
    if (!requestingLobbyUser) {
      throw new AppError('You are not in this lobby');
    }

    const isOwner = lobby.isOwner(session.userId);
    const isChangingSelf = session.userId === input.targetUserId;

    if (!isOwner && !isChangingSelf) {
      throw new AppError(
        'You can only change your own role unless you are the lobby owner'
      );
    }

    if (
      input.newRole === LOBBY_USER_ROLES.PLAYER &&
      targetLobbyUser.role === LOBBY_USER_ROLES.SPECTATOR
    ) {
      const currentPlayers = await this.ctx.lobbyUserRepo.getPlayersByLobbyId(
        input.lobbyId
      );

      if (currentPlayers.length >= MAX_PLAYERS_PER_LOBBY) {
        throw new AppError(
          `Cannot become a player. Maximum of ${MAX_PLAYERS_PER_LOBBY} players allowed per lobby`
        );
      }
    }

    targetLobbyUser.setRole(input.newRole);
    console.log(targetLobbyUser.role, input.newRole);
    if (
      targetLobbyUser.role === LOBBY_USER_ROLES.PLAYER &&
      input.newRole === LOBBY_USER_ROLES.SPECTATOR
    ) {
      console.log('reset deck');
      targetLobbyUser.setDeck(undefined);
    }

    // Save the updated lobby user
    await this.ctx.lobbyUserRepo.save(targetLobbyUser);

    return { success: true };
  }
}
