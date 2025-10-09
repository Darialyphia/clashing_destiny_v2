import type { UserId } from 'lucia';
import type { DeckId } from '../../deck/entities/deck.entity';
import type { UseCase } from '../../usecase';
import type { FriendlyChallengeId } from '../entities/friendlyChallenge.entity';
import type { FriendlyChallengeRepository } from '../repositories/friendlyChallenge.repository';
import { ensureAuthenticated } from '../../auth/auth.utils';
import type { AuthSession } from '../../auth/entities/session.entity';
import { AppError, DomainError } from '../../utils/error';

export type SelectFriendlyChallengeDeckUseCaseInput = {
  friendlyChallengeId: FriendlyChallengeId;
  deckId: DeckId;
};

export type SelectFriendlyChallengeDeckUseCaseOutput = {
  success: boolean;
};

export class SelectFriendlyChallengeDeckUseCase
  implements
    UseCase<
      SelectFriendlyChallengeDeckUseCaseInput,
      SelectFriendlyChallengeDeckUseCaseOutput
    >
{
  static INJECTION_KEY = 'selectFriendlyChallengeDeckUseCase' as const;

  constructor(
    private ctx: {
      session: AuthSession | null;
      friendlyChallengeRepo: FriendlyChallengeRepository;
    }
  ) {}

  async execute(input: SelectFriendlyChallengeDeckUseCaseInput) {
    const session = ensureAuthenticated(this.ctx.session);

    const friendlyChallenge = await this.ctx.friendlyChallengeRepo.getById(
      input.friendlyChallengeId
    );
    if (!friendlyChallenge) {
      throw new AppError('Friendly challenge not found');
    }

    if (!friendlyChallenge.canSelectDeck) {
      throw new DomainError(
        'You cannot select a deck for a challenge that has not been accepted yet'
      );
    }

    friendlyChallenge.selectDeck(session.userId, input.deckId);
    await this.ctx.friendlyChallengeRepo.save(friendlyChallenge);

    return { success: true };
  }
}
