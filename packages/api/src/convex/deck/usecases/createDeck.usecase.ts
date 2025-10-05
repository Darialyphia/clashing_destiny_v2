import { ensureAuthenticated } from '../../auth/auth.utils';
import type { AuthSession } from '../../auth/entities/session.entity';
import { type UseCase } from '../../usecase';
import type { DeckId } from '../entities/deck.entity';
import type { DeckRepository } from '../repositories/deck.repository';

export interface CreateDeckOutput {
  deckId: DeckId;
}

export class CreateDeckUseCase implements UseCase<never, CreateDeckOutput> {
  static INJECTION_KEY = 'createDeckUseCase' as const;

  constructor(private ctx: { deckRepo: DeckRepository; session: AuthSession | null }) {}

  async execute() {
    const session = ensureAuthenticated(this.ctx.session);
    const deck = await this.ctx.deckRepo.create(session.userId);

    return { deckId: deck.id };
  }
}
