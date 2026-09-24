import type { EmptyObject } from '@game/shared';
import type { UseCase } from '../../usecase';
import type { ShopOffer } from '../catalog';
import type { ShopCategory } from '../shop.constants';
import { shopCatalog } from '../catalog';
import type { TransactionReadRepository } from '../../currency/repositories/transaction-read.repository';
import type { AuthSession } from '../../auth/entities/session.entity';
import { ensureAuthenticated } from '../../auth/auth.utils';

export interface GetCatalogByCategoryInput {
  category: ShopCategory;
}

export interface GetCatalogByCategoryOutput {
  items: Array<
    Pick<
      ShopOffer,
      'sku' | 'contents' | 'category' | 'name' | 'icon' | 'price' | 'hot'
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
      transactionRepo: TransactionReadRepository;
      session: AuthSession | null;
    }
  ) {}

  async execute(input: GetCatalogByCategoryInput): Promise<GetCatalogByCategoryOutput> {
    ensureAuthenticated(this.ctx.session);

    const now = new Date();
    const items = shopCatalog
      .filter(offer => offer.category === input.category)
      .filter(offer => offer.availability.every(rule => rule.isAvailable(now)));

    return {
      items: items.map(item => ({
        sku: item.sku,
        contents: item.contents,
        category: item.category,
        name: item.name,
        icon: item.icon,
        price: item.price,
        hot: item.hot,
        canPurchase: item.purchaseLimits.every(rule => rule.canPurchase([])) //FIXME when we have ShopPurchase entity redy
      }))
    };
  }
}
