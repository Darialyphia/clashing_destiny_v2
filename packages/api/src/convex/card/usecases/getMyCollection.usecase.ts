import { ensureAuthenticated } from '../../auth/auth.utils';
import { QueryUseCase } from '../../usecase';
import type { CardId } from '../entities/card.entity';

export type GetMyCollectionOutput = Array<{
  id: CardId;
  blueprintId: string;
  isFoil: boolean;
  copiesOwned: number;
}>;

export class GetMyCollectionUseCase extends QueryUseCase<never, GetMyCollectionOutput> {
  static INJECTION_KEY = 'getMyCollectionUseCase' as const;

  async execute(): Promise<GetMyCollectionOutput> {
    const session = ensureAuthenticated(this.ctx.session);

    const cards = await this.ctx.cardReadRepo.findByOwnerId(session.userId);

    return cards.map(card => ({
      id: card._id,
      blueprintId: card.blueprintId,
      isFoil: card.isFoil,
      copiesOwned: card.copiesOwned
    }));
  }
}
