import type { UserId } from '../../users/entities/user.entity';
import type { GiftSource } from '../gift.constants';
import type { UseCase } from '../../usecase';
import type { GiftRepository } from '../repositories/gift.repository';
import type { UserRepository } from '../../users/repositories/user.repository';
import { AppError } from '../../utils/error';

export type GiveGiftInput = {
  receiverId: UserId;
  name: string;
  source: GiftSource;
  contents: Array<
    | {
        kind: 'DECK';
        deckId: string;
      }
    | {
        kind: 'CARDS';
        cards: Array<{
          blueprintId: string;
          isFoil: boolean;
          amount: number;
        }>;
      }
  >;
};

export type GiveGiftOutput = {
  giftId: string;
  success: boolean;
};

export class GiveGiftUseCase implements UseCase<GiveGiftInput, GiveGiftOutput> {
  static INJECTION_KEY = 'giveGiftUseCase' as const;

  constructor(
    private ctx: {
      giftRepo: GiftRepository;
      userRepo: UserRepository;
    }
  ) {}

  async execute(input: GiveGiftInput): Promise<GiveGiftOutput> {
    const receiver = await this.ctx.userRepo.getById(input.receiverId);
    if (!receiver) {
      throw new AppError('Receiver not found');
    }

    if (input.contents.length === 0) {
      throw new AppError('Gift must have contents');
    }

    const gift = await this.ctx.giftRepo.create({
      receiverId: input.receiverId,
      name: input.name,
      source: input.source,
      contents: input.contents
    });

    if (!gift) {
      throw new AppError('Failed to create gift');
    }

    return {
      giftId: gift.id,
      success: true
    };
  }
}
