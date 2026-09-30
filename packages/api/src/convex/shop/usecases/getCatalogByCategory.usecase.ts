import type { UseCase } from '../../usecase';
import type { ShopOffer } from '../catalog';
import type { ShopCategory } from '../shop.constants';
import { shopCatalog } from '../catalog';
import type { TransactionReadRepository } from '../../currency/repositories/transaction-read.repository';
import type { AuthSession } from '../../auth/entities/session.entity';
import { ensureAuthenticated } from '../../auth/auth.utils';
import { CURRENCY_SOURCES } from '../../currency/currency.constants';

export interface GetCatalogByCategoryInput {
  category: ShopCategory;
}

export interface GetCatalogByCategoryOutput {
  items: Array<
    Pick<
      ShopOffer,
      | 'sku'
      | 'contents'
      | 'category'
      | 'name'
      | 'description'
      | 'icon'
      | 'price'
      | 'hot'
      | 'quantity'
    > & {
      canPurchase: boolean;
    }
  >;
}

export class GetCatalogByCategoryUseCase
  implements UseCase<GetCatalogByCategoryInput, GetCatalogByCategoryOutput>
{
  static INJECTION_KEY = 'getCatalogByCategoryUseCase' as const;

  constructor(
    protected ctx: {
      transactionReadRepo: TransactionReadRepository;
      session: AuthSession | null;
    }
  ) {}

  async execute(input: GetCatalogByCategoryInput): Promise<GetCatalogByCategoryOutput> {
    ensureAuthenticated(this.ctx.session);

    const now = new Date();
    const items = shopCatalog
      .filter(offer => offer.category === input.category)
      .filter(offer => offer.availability.every(rule => rule.isAvailable(now)));
    const transactions = await this.ctx.transactionReadRepo.getByUserIdAndSource(
      this.ctx.session!.userId,
      CURRENCY_SOURCES.SHOP_PURCHASE
    );
    return {
      items: items.map(item => ({
        sku: item.sku,
        contents: item.contents,
        category: item.category,
        name: item.name,
        description: item.description,
        icon: item.icon,
        price: item.price,
        hot: item.hot,
        quantity: item.quantity,
        canPurchase: item.purchaseLimits.every(rule =>
          rule.canPurchase(
            transactions.map(tx => {
              return {
                sku: tx.metadata!.sku,
                purchasedAt: new Date(tx.createdAt)
              };
            })
          )
        )
      }))
    };
  }
}
