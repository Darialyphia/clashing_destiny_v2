import type { CardId } from '../../card/entities/card.entity';
import { QueryUseCase } from '../../usecase';
import type { DeckDoc, DeckId } from '../entities/deck.entity';

export type GetDecksOutput = Array<{
  name: string;
  id: DeckId;
  mainDeck: Array<{
    cardId: CardId;
    isFoil: boolean;
    blueprintId: string;
    copies: number;
  }>;
  destinyDeck: Array<{
    cardId: CardId;
    isFoil: boolean;
    blueprintId: string;
    copies: number;
  }>;
}>;

export class GetDecksUseCase extends QueryUseCase<never, GetDecksOutput> {
  static INJECTION_KEY = 'GetDecksUseCase' as const;

  private async populateDeckList(deckList: DeckDoc['mainDeck']) {
    return Promise.all(
      deckList.map(async item => {
        const card = await this.ctx.cardReadRepo.findById(item.cardId);
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
    const mainDeck = await this.populateDeckList(deck.mainDeck);
    const destinyDeck = await this.populateDeckList(deck.destinyDeck);

    return {
      id: deck._id,
      name: deck.name,
      mainDeck,
      destinyDeck
    };
  }

  async execute() {
    if (!this.ctx.session) {
      throw new Error('Not authenticated');
    }

    const decks = await this.ctx.deckReadRepo.findByOwnerId(this.ctx.session.userId);

    const populatedDecks = await Promise.all(decks.map(deck => this.populateDeck(deck)));

    return populatedDecks;
  }
}
