import { ensureAuthenticated } from '../../auth/auth.utils';
import type { AuthSession } from '../../auth/entities/session.entity';
import type { CardId } from '../../card/entities/card.entity';
import type { CardReadRepository } from '../../card/repositories/card.repository';
import type { UseCase } from '../../usecase';
import type { DeckDoc, DeckId } from '../entities/deck.entity';
import type { DeckReadRepository } from '../repositories/deck.repository';

export type GetDecksOutput = Array<{
  name: string;
  id: DeckId;
  cards: Array<{
    cardId: CardId;
    isFoil: boolean;
    blueprintId: string;
    copies: number;
  }>;
}>;

export class GetDecksUseCase implements UseCase<never, GetDecksOutput> {
  static INJECTION_KEY = 'GetDecksUseCase' as const;

  constructor(
    private ctx: {
      deckReadRepo: DeckReadRepository;
      cardReadRepo: CardReadRepository;
      session: AuthSession | null;
    }
  ) {}

  private async populateDeckList(deckList: DeckDoc['cards']) {
    return Promise.all(
      deckList.map(async item => {
        const card = await this.ctx.cardReadRepo.getById(item.cardId);
        if (!card) {
          throw new Error(`Card with id ${item.cardId} not found`);
        }
        return {
          cardId: item.cardId,
          isFoil: card.isFoil,
          blueprintId: card.blueprintId,
          copies: item.copies
        };
      })
    );
  }

  private async populateDeck(deck: DeckDoc) {
    const cards = await this.populateDeckList(deck.cards);

    return {
      id: deck._id,
      name: deck.name,
      cards
    };
  }

  async execute() {
    const session = ensureAuthenticated(this.ctx.session);

    const decks = await this.ctx.deckReadRepo.getByOwnerId(session.userId);

    const populatedDecks = await Promise.all(decks.map(deck => this.populateDeck(deck)));

    return populatedDecks;
  }
}
