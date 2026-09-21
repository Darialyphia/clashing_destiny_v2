import type { UseCase } from '../../usecase';
import type { AuthSession } from '../../auth/entities/session.entity';
import { ensureAuthenticated } from '../../auth/auth.utils';
import { AppError } from '../../utils/error';
import type { WalletRepository } from '../../currency/repositories/wallet.repository';
import type { TransactionRepository } from '../../currency/repositories/transaction.repository';
import type { BoosterPackRepository } from '../repositories/booster-pack.repository';
import type { EventEmitter } from '../../shared/eventEmitter';
import { CURRENCY_TYPES } from '../../currency/currency.constants';
import { BoosterPacksPurchasedEvent } from '../events/boosterPacksPurchased.event';
import type { BoosterPackId } from '../entities/booster-pack.entity';
import type { SpendCurrencyUseCase } from '../../currency/usecases/spendCurrency.usecase';
import { BoosterPackPurchase } from '../boosterPackPurchase';
import type { UserId } from '../../users/entities/user.entity';
import type { CurrencyService } from '../../currency/services/currency.service';
import { SpendingAmount } from '../../currency/spendingAmount';

export interface PurchaseBoosterPacksInput {
  packType: string;
  quantity: number;
}

export interface PurchaseBoosterPacksOutput {
  packIds: BoosterPackId[];
  goldSpent: number;
}

export class PurchaseBoosterPacksUseCase
  implements UseCase<PurchaseBoosterPacksInput, PurchaseBoosterPacksOutput>
{
  static INJECTION_KEY = 'purchaseBoosterPacksUseCase' as const;

  constructor(
    protected ctx: {
      session: AuthSession | null;
      walletRepo: WalletRepository;
      transactionRepo: TransactionRepository;
      boosterPackRepo: BoosterPackRepository;
      eventEmitter: EventEmitter;
      currencyService: CurrencyService;
    }
  ) {}

  async payForPacks(userId: UserId, purchase: BoosterPackPurchase) {
    await this.ctx.currencyService.spend({
      userId,
      amount: new SpendingAmount(purchase.totalCost),
      currencyType: CURRENCY_TYPES.GOLD,
      purpose: 'Booster pack purchase',
      metadata: purchase.metadata
    });
  }

  async createPack(
    userId: UserId,
    purchase: BoosterPackPurchase
  ): Promise<BoosterPackId> {
    purchase.generateContent();
    const packId = await this.ctx.boosterPackRepo.create({
      ownerId: userId,
      packType: purchase.metadata.packType,
      content: purchase.content
    });

    return packId;
  }

  async execute(input: PurchaseBoosterPacksInput): Promise<PurchaseBoosterPacksOutput> {
    const session = ensureAuthenticated(this.ctx.session);

    const purchase = new BoosterPackPurchase(input.quantity, input.packType);

    await this.payForPacks(session.userId, purchase);

    const packIds: BoosterPackId[] = [];
    for (let i = 0; i < input.quantity; i++) {
      const packId = await this.createPack(session.userId, purchase);
      packIds.push(packId);
    }

    await this.ctx.eventEmitter.emit(
      BoosterPacksPurchasedEvent.EVENT_NAME,
      new BoosterPacksPurchasedEvent({
        userId: session.userId,
        packType: input.packType,
        quantity: input.quantity,
        packIds,
        goldSpent: purchase.totalCost
      })
    );

    return {
      packIds,
      goldSpent: purchase.totalCost
    };
  }
}
