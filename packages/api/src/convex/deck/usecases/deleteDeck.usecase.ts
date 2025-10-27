import { ensureAuthenticated } from '../../auth/auth.utils';
import type { AuthSession } from '../../auth/entities/session.entity';
import { type UseCase } from '../../usecase';
import { AppError, DomainError } from '../../utils/error';
import type { DeckId } from '../entities/deck.entity';
import type { DeckRepository } from '../repositories/deck.repository';
import type { MatchmakingUserRepository } from '../../matchmaking/repositories/matchmakingUser.repository';
import type { GameRepository } from '../../game/repositories/game.repository';
import { GAME_STATUS, type GameStatus } from '../../game/game.constants';
import type { UserId } from '../../users/entities/user.entity';

export interface DeleteDeckInput {
  deckId: DeckId;
}

export interface DeleteDeckOutput {
  success: boolean;
}

export class DeleteDeckUseCase implements UseCase<DeleteDeckInput, DeleteDeckOutput> {
  static INJECTION_KEY = 'deleteDeckUseCase' as const;

  constructor(
    private ctx: {
      deckRepo: DeckRepository;
      session: AuthSession | null;
      matchmakingUserRepo: MatchmakingUserRepository;
      gameRepo: GameRepository;
    }
  ) {}

  private async checkUserInGameWithDeck(
    userId: UserId,
    deckId: DeckId,
    status: GameStatus
  ) {
    const game = await this.ctx.gameRepo.byUserIdAndStatus(userId, status);
    if (game) {
      const playerInGame = game.players.find(p => p.userId === userId);
      if (playerInGame && playerInGame.deckId === deckId) {
        return true;
      }
    }
    return false;
  }

  async execute(input: DeleteDeckInput) {
    const session = ensureAuthenticated(this.ctx.session);
    const deck = await this.ctx.deckRepo.findById(input.deckId);
    if (!deck) throw new AppError(`Deck with id ${input.deckId} not found`);

    if (!deck.isOwnedBy(session.userId)) {
      throw new DomainError('You do not have permission to delete this deck');
    }
    const matchmakingUser = await this.ctx.matchmakingUserRepo.byUserId(session.userId);
    if (matchmakingUser && matchmakingUser.deckId === input.deckId) {
      throw new DomainError('Cannot delete a deck while queued in matchmaking with it');
    }

    const isInWaitingGame = await this.checkUserInGameWithDeck(
      session.userId,
      input.deckId,
      GAME_STATUS.WAITING_FOR_PLAYERS
    );
    const isInOngoingGame = await this.checkUserInGameWithDeck(
      session.userId,
      input.deckId,
      GAME_STATUS.ONGOING
    );

    if (isInWaitingGame || isInOngoingGame) {
      throw new DomainError('Cannot delete a deck while in an active game with it');
    }

    await this.ctx.deckRepo.delete(deck);

    return { success: true };
  }
}
