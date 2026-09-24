<script setup lang="ts">
import { useMe } from '@/auth/composables/useMe';
import FancyButton from '@/ui/components/FancyButton.vue';
import { SHOP_CATEGORIES, type ShopCategory } from '@game/api';
import ShopOffer from './ShopOffer.vue';
import { useCatalogByCategory } from './useShop';
import UiSpinner from '@/ui/components/UiSpinner.vue';

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
      <FancyButton text="Back" :to="{ name: 'ClientHome' }" />
    </div>

    <main class="shop-layout surface-transparent">
      <aside class="shop-sidebar">
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
                :aria-current="
                  selectedCategory === category ? 'page' : undefined
                "
                @click="selectedCategory = category"
              >
                <span class="category-dot" aria-hidden="true" />
                {{ category.replace('_', ' ') }}
              </button>
            </li>
          </ul>
        </nav>
      </aside>

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
  margin: 0 auto;
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  align-items: start;
  gap: var(--size-8);
  padding: var(--size-7);
  background: linear-gradient(to top, #000a, #0006);
}

.shop-sidebar {
  position: sticky;
  top: var(--size-5);
  min-height: 360px;
  display: flex;
  flex-direction: column;
  padding: var(--size-5) var(--size-2);
  border-inline-end: 1px solid hsl(var(--color-primary-hsl) / 0.2);
}

.sidebar-heading p,
.sidebar-heading span {
  margin: 0;
}

.sidebar-heading p {
  color: var(--primary);
  font-size: var(--font-size-00);
  font-weight: var(--font-weight-8);
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.sidebar-heading div > span {
  display: block;
  margin-block-start: var(--size-1);
  color: var(--text-3);
  font-size: var(--font-size-000);
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.sidebar-note p {
  margin: 0;
}

.shop-categories {
  padding-block-start: var(--size-5);
}

.shop-categories ul {
  display: grid;
  gap: var(--size-2);
  margin: 0;
  padding: 0;
  list-style: none;
}

.category {
  width: 100%;
  display: flex;
  align-items: center;
  gap: var(--size-2);
  padding: var(--size-3);
  border: 1px solid transparent;
  background: transparent;
  color: var(--text-3);
  font-family: 'Lato', sans-serif;
  font-size: var(--font-size-1);
  font-weight: var(--font-weight-7);
  text-align: start;
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
  min-width: 0;
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

  .shop-layout {
    display: block;
    padding: var(--size-4);
  }

  .shop-sidebar {
    position: static;
    min-height: 0;
    padding: 0 0 var(--size-4);
    border-inline-end: 0;
    border-block-end: 1px solid hsl(var(--color-primary-hsl) / 0.2);
  }

  .shop-categories {
    padding-block-start: 0;
    overflow-x: auto;
    scrollbar-width: thin;
  }

  .shop-categories ul {
    display: flex;
    width: max-content;
    gap: var(--size-2);
  }

  .category {
    width: auto;
    white-space: nowrap;
  }

  .category-content {
    padding-block-start: var(--size-5);
  }
}
</style>
