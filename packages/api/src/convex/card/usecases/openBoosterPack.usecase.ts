import type { UseCase } from '../../usecase';
import type { AuthSession } from '../../auth/entities/session.entity';
import { ensureAuthenticated } from '../../auth/auth.utils';
import { AppError, DomainError } from '../../utils/error';
import type { BoosterPackRepository } from '../repositories/booster-pack.repository';
import type { CardRepository } from '../repositories/card.repository';
import type { EventEmitter } from '../../shared/eventEmitter';
import type { BoosterPackId } from '../entities/booster-pack.entity';
import { BoosterPackOpenedEvent } from '../events/boosterPackOpened.event';
import { assert, isDefined } from '@game/shared';

export interface OpenBoosterPackInput {
  packId: BoosterPackId;
}

export interface OpenBoosterPackOutput {
  packId: BoosterPackId;
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
      boosterPackRepo: BoosterPackRepository;
      cardRepo: CardRepository;
      eventEmitter: EventEmitter;
    }
  ) {}

  async execute(input: OpenBoosterPackInput): Promise<OpenBoosterPackOutput> {
    const session = ensureAuthenticated(this.ctx.session);

    const pack = await this.ctx.boosterPackRepo.getById(input.packId);
    assert(isDefined(pack), new AppError('Booster pack not found'));

    assert(
      pack.isOwnedBy(session.userId),
      new DomainError('Not authorized to open this pack')
    );
    assert(!pack.isOpened, new DomainError('Booster pack already opened'));

    pack.open();
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

    await this.ctx.boosterPackRepo.save(pack);

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
      packId: input.packId,
      cards: cardsObtained
    };
  }
}
