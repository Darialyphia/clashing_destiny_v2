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
  hero: {
    cardId: CardId;
    isFoil: boolean;
    blueprintId: string;
  } | null;
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

  private async populateDeckList(deckList: DeckDoc['mainDeck']) {
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

  private async populateHero(hero: DeckDoc['hero']) {
    if (!hero.cardId) {
      return null;
    }

    const card = await this.ctx.cardReadRepo.getById(hero.cardId);
    if (!card) {
      throw new Error(`Card with id ${hero.cardId} not found`);
    }

    return {
      cardId: hero.cardId,
      isFoil: card.isFoil,
      blueprintId: card.blueprintId
    };
  }

  private async populateDeck(deck: DeckDoc) {
    const [hero, mainDeck, destinyDeck] = await Promise.all([
      this.populateHero(deck.hero),
      this.populateDeckList(deck.mainDeck),
      this.populateDeckList(deck.destinyDeck)
    ]);

    return {
      id: deck._id,
      name: deck.name,
      mainDeck,
      destinyDeck,
      hero
    };
  }

  async execute() {
    const session = ensureAuthenticated(this.ctx.session);

    const decks = await this.ctx.deckReadRepo.getByOwnerId(session.userId);

    const populatedDecks = await Promise.all(decks.map(deck => this.populateDeck(deck)));

    return populatedDecks;
  }
}
