import type { UseCase } from '../../usecase';
import type { AuthSession } from '../../auth/entities/session.entity';
import { ensureAuthenticated } from '../../auth/auth.utils';
import { AppError } from '../../utils/error';
import type { WalletRepository } from '../../currency/repositories/wallet.repository';
import type { TransactionRepository } from '../../currency/repositories/transaction.repository';
import type { BoosterPackRepository } from '../repositories/booster-pack.repository';
import type { EventEmitter } from '../../shared/eventEmitter';
import { BOOSTER_PACKS_CATALOG } from '../card.constants';
import { CURRENCY_TYPES } from '../../currency/currency.constants';
import { BoosterPacksPurchasedEvent } from '../events/boosterPacksPurchased.event';
import type { BoosterPackId } from '../entities/booster-pack.entity';
import type { SpendCurrencyUseCase } from '../../currency/usecases/spendCurrency.usecase';

const MAX_PACKS_PER_PURCHASE = 10;
const MIN_PACKS_PER_PURCHASE = 1;

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
      spendCurrencyUseCase: SpendCurrencyUseCase;
    }
  ) {}

  async execute(input: PurchaseBoosterPacksInput): Promise<PurchaseBoosterPacksOutput> {
    const session = ensureAuthenticated(this.ctx.session);

    const packConfig =
      BOOSTER_PACKS_CATALOG[input.packType as keyof typeof BOOSTER_PACKS_CATALOG];
    if (!packConfig) {
      throw new AppError(`Invalid pack type: ${input.packType}`);
    }

    if (
      input.quantity < MIN_PACKS_PER_PURCHASE ||
      input.quantity > MAX_PACKS_PER_PURCHASE
    ) {
      throw new AppError(
        `Quantity must be between ${MIN_PACKS_PER_PURCHASE} and ${MAX_PACKS_PER_PURCHASE}`
      );
    }

    const totalCost = packConfig.packGoldCost * input.quantity;

    const wallet = await this.ctx.walletRepo.getByUserId(session.userId);
    if (!wallet) {
      throw new AppError('Wallet not found');
    }

    await this.ctx.spendCurrencyUseCase.execute({
      amount: totalCost,
      currencyType: CURRENCY_TYPES.GOLD,
      purpose: 'Booster pack purchase',
      metadata: {
        packType: input.packType,
        quantity: input.quantity
      }
    });

    // Create booster packs
    const packIds: BoosterPackId[] = [];
    for (let i = 0; i < input.quantity; i++) {
      const content = packConfig.getContents();
      const packId = await this.ctx.boosterPackRepo.create({
        ownerId: session.userId,
        packType: input.packType,
        content
      });
      packIds.push(packId);
    }

    // Emit event
    await this.ctx.eventEmitter.emit(
      BoosterPacksPurchasedEvent.EVENT_NAME,
      new BoosterPacksPurchasedEvent({
        userId: session.userId,
        packType: input.packType,
        quantity: input.quantity,
        packIds,
        goldSpent: totalCost
      })
    );

    return {
      packIds,
      goldSpent: totalCost
    };
  }
}
