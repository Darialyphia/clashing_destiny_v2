import { ensureAuthenticated } from '../../auth/auth.utils';
import type { AuthSession } from '../../auth/entities/session.entity';
import type { CardId } from '../../card/entities/card.entity';
import { type UseCase } from '../../usecase';
import { AppError, DomainError } from '../../utils/error';
import type { DeckId } from '../entities/deck.entity';
import type { DeckRepository } from '../repositories/deck.repository';

export interface UpdateDeckInput {
  deckId: DeckId;
  name: string;
  cards: Array<{ cardId: CardId; copies: number }>;
}

export interface UpdateDeckOutput {
  success: boolean;
}

export class UpdateDeckUseCase implements UseCase<UpdateDeckInput, UpdateDeckOutput> {
  static INJECTION_KEY = 'updateDeckUseCase' as const;

  constructor(private ctx: { deckRepo: DeckRepository; session: AuthSession | null }) {}

  async execute(input: UpdateDeckInput) {
    const session = ensureAuthenticated(this.ctx.session);

    const deck = await this.ctx.deckRepo.findById(input.deckId);
    if (!deck) throw new AppError(`Deck with id ${input.deckId} not found`);

    if (!deck.isOwnedBy(session.userId)) {
      throw new DomainError('You do not have permission to update this deck');
    }

    deck.update(input);
    await this.ctx.deckRepo.save(deck);

    return { success: true };
  }
}
