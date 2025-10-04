import { QueryUseCase } from '../../usecase';
import type { Deck, DeckId } from '../entities/deck.entity';

export type GetDecksOutput = Array<{
  name: string;
  id: DeckId;
  mainDeck: Array<{
    blueprintId: string;
    copies: number;
  }>;
  destinyDeck: Array<{
    blueprintId: string;
    copies: number;
  }>;
}>;

export class GetDecksUseCase extends QueryUseCase<never, GetDecksOutput> {
  static INJECTION_KEY = 'GetDecksUseCase' as const;

  async execute() {
    if (!this.ctx.session) {
      throw new Error('Not authenticated');
    }

    const decks = await this.ctx.deckReadRepo.findByOwnerId(this.ctx.session.userId);

    return decks.map(deck => ({
      id: deck._id,
      name: deck.name,
      mainDeck: deck.mainDeck,
      destinyDeck: deck.destinyDeck
    }));
  }
}
