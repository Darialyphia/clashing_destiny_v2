import { useAuthedMutation, useAuthedQuery } from '@/auth/composables/useAuth';
import { api, type ShopCategory } from '@game/api';

export const useCatalogByCategory = (
  category: MaybeRefOrGetter<ShopCategory>
) => {
  return useAuthedQuery(
    api.shop.catalogByCategory,
    computed(() => ({ category: toValue(category) }))
  );
};

export const useShopPurchase = (onSuccess?: () => void) => {
  return useAuthedMutation(api.shop.purchaseItem, {
    onSuccess
  });
};
