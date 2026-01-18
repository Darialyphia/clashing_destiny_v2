import type { UseCase } from '../../usecase';
import type { AuthSession } from '../../auth/entities/session.entity';
import { ensureAuthenticated } from '../../auth/auth.utils';
import { AppError } from '../../utils/error';
import type { BoosterPackReadRepository } from '../repositories/booster-pack-read.repository';
import type { BoosterPackRepository } from '../repositories/booster-pack.repository';
import type { CardRepository } from '../repositories/card.repository';
import type { EventEmitter } from '../../shared/eventEmitter';
import type { BoosterPackId } from '../entities/booster-pack.entity';
import { ensurePending, ensureOwnership } from '../entities/booster-pack.entity';
import { BoosterPackOpenedEvent } from '../events/boosterPackOpened.event';

export interface OpenBoosterPackInput {
  packId: BoosterPackId;
}

export interface OpenBoosterPackOutput {
  cards: Array<{
    blueprintId: string;
    isFoil: boolean;
    copiesAdded: number;
  }>;
}

export class OpenBoosterPackUseCase
  implements UseCase<OpenBoosterPackInput, OpenBoosterPackOutput>
{
  static INJECTION_KEY = 'openBoosterPackUseCase' as const;

  constructor(
    protected ctx: {
      session: AuthSession | null;
      boosterPackReadRepo: BoosterPackReadRepository;
      boosterPackRepo: BoosterPackRepository;
      cardRepo: CardRepository;
      eventEmitter: EventEmitter;
    }
  ) {}

  async execute(input: OpenBoosterPackInput): Promise<OpenBoosterPackOutput> {
    const session = ensureAuthenticated(this.ctx.session);

    // Fetch pack
    const pack = await this.ctx.boosterPackReadRepo.getById(input.packId);
    if (!pack) {
      throw new AppError('Booster pack not found');
    }

    // Validate ownership and status
    ensureOwnership(pack, session.userId);
    ensurePending(pack);

    // Add cards to collection
    const cardsObtained: Array<{
      blueprintId: string;
      isFoil: boolean;
      copiesAdded: number;
    }> = [];

    for (const card of pack.content) {
      await this.ctx.cardRepo.create({
        ownerId: session.userId,
        blueprintId: card.blueprintId,
        isFoil: card.isFoil,
        copiesOwned: 1
      });

      cardsObtained.push({
        blueprintId: card.blueprintId,
        isFoil: card.isFoil,
        copiesAdded: 1
      });
    }

    // Mark pack as opened
    await this.ctx.boosterPackRepo.markAsOpened(input.packId);

    // Emit event
    await this.ctx.eventEmitter.emit(
      BoosterPackOpenedEvent.EVENT_NAME,
      new BoosterPackOpenedEvent({
        userId: session.userId,
        packId: input.packId,
        packType: pack.packType,
        cardsObtained: pack.content
      })
    );

    return {
      cards: cardsObtained
    };
  }
}
