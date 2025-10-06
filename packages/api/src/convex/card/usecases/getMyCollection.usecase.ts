import { ensureAuthenticated } from '../../auth/auth.utils';
import type { AuthSession } from '../../auth/entities/session.entity';
import type { UseCase } from '../../usecase';
import type { CardId } from '../entities/card.entity';
import type { CardReadRepository } from '../repositories/card.repository';

export type GetMyCollectionOutput = Array<{
  id: CardId;
  blueprintId: string;
  isFoil: boolean;
  copiesOwned: number;
}>;

export class GetMyCollectionUseCase implements UseCase<never, GetMyCollectionOutput> {
  static INJECTION_KEY = 'getMyCollectionUseCase' as const;

  constructor(
    private ctx: { cardReadRepo: CardReadRepository; session: AuthSession | null }
  ) {}

  async execute(): Promise<GetMyCollectionOutput> {
    const session = ensureAuthenticated(this.ctx.session);

    const cards = await this.ctx.cardReadRepo.getByOwnerId(session.userId);

    return cards.map(card => ({
      id: card._id,
      blueprintId: card.blueprintId,
      isFoil: card.isFoil,
      copiesOwned: card.copiesOwned
    }));
  }
}
