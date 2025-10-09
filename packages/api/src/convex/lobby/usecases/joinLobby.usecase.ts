import { ensureAuthenticated } from '../../auth/auth.utils';
import type { AuthSession } from '../../auth/entities/session.entity';
import type { UseCase } from '../../usecase';
import { AppError } from '../../utils/error';
import type { Id } from '../../_generated/dataModel';
import { LOBBY_USER_ROLES, MAX_PLAYERS_PER_LOBBY } from '../lobby.constants';
import type { LobbyRepository } from '../repositories/lobby.repository';
import type { LobbyUserRepository } from '../repositories/lobbyUser.repository';

export type JoinLobbyInput = {
  lobbyId: Id<'lobbies'>;
  password?: string;
};

export type JoinLobbyOutput = {
  role: (typeof LOBBY_USER_ROLES)[keyof typeof LOBBY_USER_ROLES];
  lobbyUserId: Id<'lobbyUsers'>;
};

export class JoinLobbyUseCase implements UseCase<JoinLobbyInput, JoinLobbyOutput> {
  static INJECTION_KEY = 'joinLobbyUseCase' as const;

  constructor(
    private ctx: {
      lobbyRepo: LobbyRepository;
      lobbyUserRepo: LobbyUserRepository;
      session: AuthSession | null;
    }
  ) {}

  async execute(input: JoinLobbyInput): Promise<JoinLobbyOutput> {
    const session = ensureAuthenticated(this.ctx.session);

    const existingLobbyUser = await this.ctx.lobbyUserRepo.getByUserId(session.userId);
    if (existingLobbyUser.length > 0) {
      throw new AppError('You are already in a lobby. Leave your current lobby first.');
    }

    const lobby = await this.ctx.lobbyRepo.getById(input.lobbyId);
    if (!lobby) {
      throw new AppError('Lobby not found');
    }

    if (!lobby.canJoin()) {
      throw new AppError('This lobby cannot be joined at the moment');
    }

    if (!lobby.validatePassword(input.password)) {
      throw new AppError('Invalid password');
    }

    const currentPlayers = await this.ctx.lobbyUserRepo.getPlayersByLobbyId(
      input.lobbyId
    );

    const role =
      currentPlayers.length < MAX_PLAYERS_PER_LOBBY
        ? LOBBY_USER_ROLES.PLAYER
        : LOBBY_USER_ROLES.SPECTATOR;

    const lobbyUser = await this.ctx.lobbyUserRepo.create({
      userId: session.userId,
      lobbyId: input.lobbyId,
      role
    });

    return {
      role,
      lobbyUserId: lobbyUser.id
    };
  }
}
