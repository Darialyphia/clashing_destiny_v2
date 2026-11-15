import type { DeckFactionId } from '@game/engine/src/card/factions/factions';
import { ensureAuthenticated } from '../../auth/auth.utils';
import type { AuthSession } from '../../auth/entities/session.entity';
import { type UseCase } from '../../usecase';
import type { DeckId } from '../entities/deck.entity';
import type { DeckRepository } from '../repositories/deck.repository';

export interface CreateDeckInput {
  // chosen once, when the deck is created
  factionId: DeckFactionId;
}

export interface CreateDeckOutput {
  deckId: DeckId;
}

export class CreateDeckUseCase implements UseCase<CreateDeckInput, CreateDeckOutput> {
  static INJECTION_KEY = 'createDeckUseCase' as const;

  constructor(private ctx: { deckRepo: DeckRepository; session: AuthSession | null }) {}

  async execute(input: CreateDeckInput) {
    const session = ensureAuthenticated(this.ctx.session);
    const deck = await this.ctx.deckRepo.create(session.userId, input.factionId);

    return { deckId: deck.id };
  }
}
