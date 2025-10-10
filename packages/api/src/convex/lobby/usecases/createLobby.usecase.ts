import { ensureAuthenticated } from '../../auth/auth.utils';
import type { AuthSession } from '../../auth/entities/session.entity';
import { DomainError } from '../../utils/error';
import type { LobbyId } from '../entities/lobby.entity';
import type { LobbyRepository } from '../repositories/lobby.repository';
import type { LobbyUserRepository } from '../repositories/lobbyUser.repository';

export type CreateLobbyInput = {
  name: string;
  password?: string;
};

export type CreateLobbyOutput = {
  success: boolean;
  lobbyId: LobbyId;
};

export class CreateLobbyUseCase {
  static INJECTION_KEY = 'createLobbyUseCase' as const;

  constructor(
    private ctx: {
      lobbyRepo: LobbyRepository;
      lobbyUserRepo: LobbyUserRepository;
      session: AuthSession | null;
    }
  ) {}

  async execute(input: CreateLobbyInput): Promise<CreateLobbyOutput> {
    const session = ensureAuthenticated(this.ctx.session);

    const lobbyUsers = await this.ctx.lobbyUserRepo.getByUserId(session.userId);
    if (lobbyUsers.length > 0) {
      throw new DomainError('User is already in a lobby');
    }

    const lobby = await this.ctx.lobbyRepo.create({
      name: input.name,
      ownerId: session.userId,
      password: input.password,
      options: {
        disableTurnTimers: false,
        teachingMode: false
      }
    });

    return { success: true, lobbyId: lobby.id };
  }
}
