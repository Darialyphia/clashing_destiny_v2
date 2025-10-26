import type { BetterExtract } from '@game/shared';
import type { GiftId } from '../entities/gift.entity';
import type { GiftKind, GiftState } from '../gift.constants';
import type { GiftReadRepository } from '../repositories/gift.repository';
import type { AuthSession } from '../../auth/entities/session.entity';
import { ensureAuthenticated } from '../../auth/auth.utils';
import type { UseCase } from '../../usecase';

export type GetMyGiftsInput = never;

export type GetMyGiftsOutput = Array<{
  id: GiftId;
  name: string;
  state: GiftState;
  receivedAt: number;
  contents: Array<
    | {
        kind: BetterExtract<GiftKind, 'DECK'>;
        deckId: string;
      }
    | {
        kind: BetterExtract<GiftKind, 'CARDS'>;
        cards: Array<{
          blueprintId: string;
          isFoil: boolean;
          amount: number;
        }>;
      }
  >;
}>;

export class GetMyGiftsUseCase implements UseCase<GetMyGiftsInput, GetMyGiftsOutput> {
  static INJECTION_KEY = 'getMyGiftsUseCase' as const;

  constructor(
    private ctx: { giftReadRepo: GiftReadRepository; session: AuthSession | null }
  ) {}

  async execute(): Promise<GetMyGiftsOutput> {
    const session = ensureAuthenticated(this.ctx.session);

    const gifts = await this.ctx.giftReadRepo.getByReceiverId(session.userId);

    return gifts.map(gift => ({
      id: gift._id,
      name: gift.name,
      state: gift.state,
      contents: gift.contents,
      receivedAt: gift._creationTime
    }));
  }
}
