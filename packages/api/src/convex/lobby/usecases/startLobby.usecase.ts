import { ensureAuthenticated } from '../../auth/auth.utils';
import type { AuthSession } from '../../auth/entities/session.entity';
import type { UseCase } from '../../usecase';
import { AppError } from '../../utils/error';
import type { Id } from '../../_generated/dataModel';
import { MAX_PLAYERS_PER_LOBBY } from '../lobby.constants';
import type { LobbyRepository } from '../repositories/lobby.repository';
import type { LobbyUserRepository } from '../repositories/lobbyUser.repository';
import type { EventEmitter } from '../../shared/eventEmitter';
import { LobbyGameStartedEvent } from '../events/lobbyGameStarted.event';

export type StartLobbyInput = {
  lobbyId: Id<'lobbies'>;
};

export type StartLobbyOutput = {
  success: boolean;
};

export class StartLobbyUseCase implements UseCase<StartLobbyInput, StartLobbyOutput> {
  static INJECTION_KEY = 'startLobbyUseCase' as const;

  constructor(
    private ctx: {
      lobbyRepo: LobbyRepository;
      lobbyUserRepo: LobbyUserRepository;
      session: AuthSession | null;
      eventEmitter: EventEmitter;
    }
  ) {}

  async execute(input: StartLobbyInput): Promise<StartLobbyOutput> {
    const session = ensureAuthenticated(this.ctx.session);

    const lobby = await this.ctx.lobbyRepo.getById(input.lobbyId);
    if (!lobby) {
      throw new AppError('Lobby not found');
    }

    if (!lobby.isOwner(session.userId)) {
      throw new AppError('Only the lobby owner can start the game');
    }

    if (!lobby.canStartGame()) {
      throw new AppError('Lobby cannot be started in its current status');
    }

    const players = await this.ctx.lobbyUserRepo.getPlayersByLobbyId(input.lobbyId);

    if (players.length < MAX_PLAYERS_PER_LOBBY) {
      throw new AppError(
        `Cannot start game. Need ${MAX_PLAYERS_PER_LOBBY} players, but only ${players.length} player(s) in lobby`
      );
    }

    const playersWithoutDecks = players.filter(player => !player.deckId);
    if (playersWithoutDecks.length > 0) {
      throw new AppError(
        'Cannot start game. All players must select their decks before starting'
      );
    }

    lobby.startCreatingGame();

    await this.ctx.lobbyRepo.save(lobby);
    await this.ctx.eventEmitter.emit(
      LobbyGameStartedEvent.EVENT_NAME,
      new LobbyGameStartedEvent(lobby.id)
    );

    return { success: true };
  }
}
