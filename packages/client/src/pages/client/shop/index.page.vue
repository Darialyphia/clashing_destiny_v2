<script setup lang="ts">
import { useMe } from '@/auth/composables/useMe';
import FancyButton from '@/ui/components/FancyButton.vue';
import { SHOP_CATEGORIES, type ShopCategory } from '@game/api';
import ShopOffer from './ShopOffer.vue';
import { useCatalogByCategory } from './useShop';

definePage({
  name: 'Shop',
  path: '/client/shop',
  meta: {
    requiresAuth: true,
    wrapperClass: 'page-blur'
  }
});

const { data: me } = useMe();

const selectedCategory = ref<ShopCategory>(SHOP_CATEGORIES.BOOSTER_PACKS);
const { data: catalog, isLoading } = useCatalogByCategory(selectedCategory);
</script>

<template>
  <div v-if="me" class="shop-page">
    <div class="shop-topbar">
      <FancyButton text="Back" size="sm" :to="{ name: 'ClientHome' }" />
    </div>

    <main class="shop-layout surface">
      <nav class="shop-categories" aria-label="Shop categories">
        <ul>
          <li
            v-for="category in Object.values(SHOP_CATEGORIES)"
            :key="category"
          >
            <button
              type="button"
              class="category"
              :class="{ selected: selectedCategory === category }"
              :aria-current="selectedCategory === category ? 'page' : undefined"
              @click="selectedCategory = category"
            >
              <span class="category-dot" aria-hidden="true" />
              {{ category.replace('_', ' ') }}
            </button>
          </li>
        </ul>
      </nav>

      <section class="category-content">
        <div v-if="isLoading" class="loading-state">
          <UiSpinner size="8" />
          <span>Loading catalog...</span>
        </div>
        <div v-else-if="catalog.items.length === 0" class="empty-state">
          <span class="empty-icon" aria-hidden="true">◌</span>
          <h3>The catalog is empty for this category</h3>
          <p>Check another category for the next opportunity.</p>
        </div>
        <ul v-else class="offer-grid">
          <li v-for="offer in catalog.items" :key="offer.sku">
            <ShopOffer :offer="offer" />
          </li>
        </ul>
      </section>
    </main>
  </div>
</template>

<style scoped lang="postcss">
.shop-page {
  min-height: 100vh;
  background-image: url('@/assets/backgrounds/main-menu-overlay.png');
  background-size: cover;
  background-attachment: fixed;
  padding: var(--size-5) clamp(var(--size-4), 5vw, var(--size-10));
  color: var(--text-1);
}

.shop-layout {
  max-width: 1180px;
  margin: 0 auto;
}

.shop-categories {
  display: flex;
  align-items: center;
  gap: var(--size-6);
  padding-block: var(--size-5);
  border-block-end: 1px solid hsl(var(--color-primary-hsl) / 0.16);
}

.shop-categories ul {
  display: flex;
  gap: var(--size-2);
  flex-wrap: wrap;
  margin: 0;
  padding: 0;
  list-style: none;
}

.category {
  display: inline-flex;
  align-items: center;
  gap: var(--size-2);
  padding: var(--size-2) var(--size-3);
  border: 1px solid transparent;
  background: transparent;
  color: var(--text-3);
  font-family: 'Lato', sans-serif;
  font-size: var(--font-size-1);
  font-weight: var(--font-weight-7);
  text-transform: capitalize;
  transition:
    color 0.2s ease,
    border-color 0.2s ease,
    background 0.2s ease;
}

.category:hover,
.category.selected {
  border-color: hsl(var(--color-primary-hsl) / 0.35);
  background: hsl(var(--color-primary-hsl) / 0.08);
  color: var(--primary);
}

.category-dot {
  width: 6px;
  height: 6px;
  border: 1px solid currentColor;
  transform: rotate(45deg);
}

.category.selected .category-dot {
  background: currentColor;
  box-shadow: 0 0 12px currentColor;
}

.category-content {
  padding-block-start: var(--size-7);
}

.offer-grid {
  display: flex;
  gap: var(--size-5);
  flex-wrap: wrap;
  margin: 0;
  padding: 0;
  list-style: none;
}

.loading-state,
.empty-state {
  min-height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: var(--size-3);
  border: 1px dashed hsl(var(--color-primary-hsl) / 0.25);
  color: var(--text-2);
  text-align: center;
}

.empty-state h3,
.empty-state p {
  margin: 0;
}

.empty-state h3 {
  color: var(--text-1);
  font-size: var(--font-size-3);
}

.empty-state p {
  color: var(--text-3);
}

.empty-icon {
  color: var(--primary);
  font-size: var(--font-size-7);
}

@media (max-width: 600px) {
  .shop-page {
    padding: var(--size-3);
  }

  .shop-topbar {
    margin-block-end: var(--size-5);
  }

  .shop-categories {
    align-items: flex-start;
    flex-direction: column;
    gap: var(--size-3);
  }
}
</style>
