import { v } from 'convex/values';
import { queryWithContainer, mutationWithContainer } from './shared/container';
import { GetCatalogByCategoryUseCase } from './shop/usecases/getCatalogByCategory.usecase';
import { SHOP_CATEGORY_VALIDATOR } from './shop/shop.validators';
import { PurchaseItemUseCase } from './shop/usecases/purchaseItem.usecase';
import { CURRENCY_TRANSACTION_TYPE_VALIDATOR } from './currency/currency.schemas';

export const catalogByCategory = queryWithContainer({
  args: { category: SHOP_CATEGORY_VALIDATOR },
  handler: async (container, { category }) => {
    const useCase = container.resolve<GetCatalogByCategoryUseCase>(
      GetCatalogByCategoryUseCase.INJECTION_KEY
    );
    return useCase.execute({ category });
  }
});

export const purchaseItem = mutationWithContainer({
  args: {
    sku: v.string(),
    currencyType: CURRENCY_TRANSACTION_TYPE_VALIDATOR,
    quantity: v.number()
  },
  handler: async (container, { sku, currencyType, quantity }) => {
    const useCase = container.resolve<PurchaseItemUseCase>(
      PurchaseItemUseCase.INJECTION_KEY
    );
    return useCase.execute({ sku, currencyType, quantity });
  }
});
