import { v } from 'convex/values';
import { queryWithContainer } from './shared/container';
import { GetCatalogByCategoryUseCase } from './shop/usecases/getCatalogByCategory.usecase';
import { SHOP_CATEGORY_VALIDATOR } from './shop/shop.validators';

export const catalogByCategory = queryWithContainer({
  args: { category: SHOP_CATEGORY_VALIDATOR },
  handler: async (container, { category }) => {
    const useCase = container.resolve<GetCatalogByCategoryUseCase>(
      GetCatalogByCategoryUseCase.INJECTION_KEY
    );
    return useCase.execute({ category });
  }
});
