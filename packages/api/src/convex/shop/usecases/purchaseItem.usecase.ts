import type { UseCase } from '../../usecase';
import type { AuthSession } from '../../auth/entities/session.entity';
import { ensureAuthenticated } from '../../auth/auth.utils';
import type { WalletRepository } from '../../currency/repositories/wallet.repository';
import type { TransactionRepository } from '../../currency/repositories/transaction.repository';
import type { EventEmitter } from '../../shared/eventEmitter';
import { CURRENCY_SOURCES, type CurrencyType } from '../../currency/currency.constants';
import type { UserId } from '../../users/entities/user.entity';
import type { CurrencyService } from '../../currency/services/currency.service';
import { SpendingAmount } from '../../currency/spendingAmount';
import { ShopPurchase } from '../shopPurchase';
import { match } from 'ts-pattern';
import type { AwardCurrencyUseCase } from '../../currency/usecases/awardCurrency.usecase';
import { BoosterPackPurchase } from '../../card/boosterPackPurchase';
import type { BoosterPackRepository } from '../../card/repositories/booster-pack.repository';
import { assert } from '@game/shared';
import { DomainError } from '../../utils/error';
import type { TransactionId } from '../../currency/entities/transaction.entity';
import type { ShopReward } from '../catalog';

export interface PurchaseItemInput {
  sku: string;
  currencyType: CurrencyType;
  quantity: number;
}

export interface PurchaseItemOutput {
  purchaseId: TransactionId;
}

export class PurchaseItemUseCase
  implements UseCase<PurchaseItemInput, PurchaseItemOutput>
{
  static INJECTION_KEY = 'purchaseItemUseCase' as const;

  constructor(
    protected ctx: {
      session: AuthSession | null;
      walletRepo: WalletRepository;
      transactionRepo: TransactionRepository;
      boosterPackRepo: BoosterPackRepository;
      eventEmitter: EventEmitter;
      currencyService: CurrencyService;
      awardCurrencyUseCase: AwardCurrencyUseCase;
    }
  ) {}

  async pay(userId: UserId, purchase: ShopPurchase) {
    return await this.ctx.currencyService.spend({
      userId,
      amount: new SpendingAmount(purchase.totalPrice!),
      currencyType: purchase.currencyType,
      purpose: 'Shop purchase',
      metadata: purchase.metadata,
      source: CURRENCY_SOURCES.SHOP_PURCHASE
    });
  }

  async provideBoosterPacks(userId: UserId, item: ShopReward & { type: 'boosterPack' }) {
    for (let i = 0; i < item.quantity; i++) {
      const boosterPackPurchase = new BoosterPackPurchase(item.quantity, item.packType);
      boosterPackPurchase.generateContent();

      await this.ctx.boosterPackRepo.create({
        ownerId: userId,
        packType: boosterPackPurchase.metadata.packType,
        content: boosterPackPurchase.content
      });
    }
  }

  async provideCurrency(userId: UserId, item: ShopReward & { type: 'currency' }) {
    await this.ctx.awardCurrencyUseCase.execute({
      userId: userId,
      amount: item.amount,
      currencyType: item.currencyType,
      source: CURRENCY_SOURCES.SHOP_OFFER_CONTENT
    });
  }

  async provideContent(userId: UserId, purchase: ShopPurchase) {
    for (let i = 0; i < purchase.quantity; i++) {
      for (const item of purchase.product!.contents) {
        await match(item)
          .with({ type: 'boosterPack' }, async item => {
            await this.provideBoosterPacks(userId, item);
          })
          .with({ type: 'currency' }, async item => {
            await this.provideCurrency(userId, item);
          })
          .exhaustive();
      }
    }
  }

  async execute(input: PurchaseItemInput): Promise<PurchaseItemOutput> {
    const session = ensureAuthenticated(this.ctx.session);

    const purchase = new ShopPurchase(input.sku, input.currencyType, input.quantity);

    const now = new Date();
    assert(
      purchase.isAvailableAt(now),
      new DomainError(
        `Product with SKU '${purchase.sku}' is not available at the current time`
      )
    );
    const transactions = await this.ctx.transactionRepo.getByUserIdAndSource(
      session.userId,
      CURRENCY_SOURCES.SHOP_PURCHASE
    );

    assert(
      purchase.canPurchase(
        transactions.map(tx => ({
          sku: tx.metadata!.sku,
          purchasedAt: new Date(tx.createdAt)
        }))
      ),
      new DomainError(
        `Cannot purchase product with SKU '${purchase.sku}' due to purchase limits`
      )
    );

    const transaction = await this.pay(session.userId, purchase);

    await this.provideContent(session.userId, purchase);

    return {
      purchaseId: transaction.transactionId
    };
  }
}
