import type { UseCase } from '../../usecase';
import type { AuthSession } from '../../auth/entities/session.entity';
import { ensureAuthenticated } from '../../auth/auth.utils';
import { AppError, DomainError } from '../../utils/error';
import type { CardRepository } from '../repositories/card.repository';
import type { WalletRepository } from '../../currency/repositories/wallet.repository';
import type { EventEmitter } from '../../shared/eventEmitter';
import type { CardId } from '../entities/card.entity';
import { assert, isDefined } from '@game/shared';
import { CURRENCY_TYPES } from '../../currency/currency.constants';
import { CardDestroyedEvent } from '../events/cardDestroyed.event';
import type { SpendCurrencyUseCase } from '../../currency/usecases/spendCurrency.usecase';
import { FOIL_UPGRADE_COST_PER_RARITY } from '../card.constants';

export interface UpgradeToFoilInput {
  cardId: CardId;
}

export interface UpgradeToFoilOutput {
  cardId: CardId;
  craftingShardsCost: number;
}

export class UpgradeToFoilUseCase
  implements UseCase<UpgradeToFoilInput, UpgradeToFoilOutput>
{
  static INJECTION_KEY = 'upgradeToFoilUseCase' as const;

  constructor(
    protected ctx: {
      session: AuthSession | null;
      cardRepo: CardRepository;
      walletRepo: WalletRepository;
      eventEmitter: EventEmitter;
      spendCurrencyUseCase: SpendCurrencyUseCase;
    }
  ) {}

  async execute(input: UpgradeToFoilInput): Promise<UpgradeToFoilOutput> {
    const session = ensureAuthenticated(this.ctx.session);

    const card = await this.ctx.cardRepo.getById(input.cardId);
    assert(isDefined(card), new AppError('Card not found'));

    assert(
      card.isOwnedBy(session.userId),
      new DomainError('you are not the owner of this card')
    );

    const upgradeCost = FOIL_UPGRADE_COST_PER_RARITY[card.blueprint.rarity];

    card.removeCopies(1);
    await this.ctx.cardRepo.save(card);

    await this.ctx.spendCurrencyUseCase.execute({
      purpose: `Upgrading card ${input.cardId} to foil`,
      amount: upgradeCost,
      currencyType: CURRENCY_TYPES.CRAFTING_SHARDS
    });

    const cardId = await this.ctx.cardRepo.create({
      ownerId: session.userId,
      blueprintId: card.blueprintId,
      isFoil: true,
      copiesOwned: 1
    });

    this.ctx.eventEmitter.emit(
      CardDestroyedEvent.EVENT_NAME,
      new CardDestroyedEvent({
        userId: session.userId,
        cardId: card.id,
        remainingCopies: card.copiesOwned.value
      })
    );

    return {
      cardId,
      craftingShardsCost: upgradeCost
    };
  }
}
