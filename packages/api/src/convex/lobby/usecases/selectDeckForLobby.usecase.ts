import { ensureAuthenticated } from '../../auth/auth.utils';
import type { AuthSession } from '../../auth/entities/session.entity';
import type { UseCase } from '../../usecase';
import { AppError } from '../../utils/error';
import type { Id } from '../../_generated/dataModel';
import type { DeckRepository } from '../../deck/repositories/deck.repository';
import type { LobbyUserRepository } from '../repositories/lobbyUser.repository';

export type SelectDeckForLobbyInput = {
  lobbyId: Id<'lobbies'>;
  deckId?: Id<'decks'>;
};

export type SelectDeckForLobbyOutput = {
  success: boolean;
};

export class SelectDeckForLobbyUseCase
  implements UseCase<SelectDeckForLobbyInput, SelectDeckForLobbyOutput>
{
  static INJECTION_KEY = 'selectDeckForLobbyUseCase' as const;

  constructor(
    private ctx: {
      deckRepo: DeckRepository;
      lobbyUserRepo: LobbyUserRepository;
      session: AuthSession | null;
    }
  ) {}

  async execute(input: SelectDeckForLobbyInput): Promise<SelectDeckForLobbyOutput> {
    const session = ensureAuthenticated(this.ctx.session);

    const lobbyUser = await this.ctx.lobbyUserRepo.getByLobbyAndUser(
      input.lobbyId,
      session.userId
    );

    if (!lobbyUser) {
      throw new AppError('You are not in this lobby');
    }

    if (!lobbyUser.isPlayer) {
      throw new AppError('Only players can select decks for lobbies');
    }

    if (input.deckId) {
      const deck = await this.ctx.deckRepo.findById(input.deckId);
      if (!deck) {
        throw new AppError('Deck not found');
      }

      if (deck.ownerId !== session.userId) {
        throw new AppError('You can only select decks that you own');
      }
    }

    lobbyUser.setDeck(input.deckId);

    await this.ctx.lobbyUserRepo.save(lobbyUser);

    return { success: true };
  }
}
