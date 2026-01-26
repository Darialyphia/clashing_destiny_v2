<script setup lang="ts">
import { useMe } from '@/auth/composables/useMe';
import AuthenticatedHeader from '@/AuthenticatedHeader.vue';
import GodlIcon from '@/player/components/GodlIcon.vue';
import FancyButton from '@/ui/components/FancyButton.vue';
import { BOOSTER_PACKS_CATALOG, type BoosterPackCatalogEntry } from '@game/api';
import PurchaseBoosterModal from './PurchaseBoosterModal.vue';

definePage({
  name: 'Shop',
  path: '/client/shop',
  meta: {
    requiresAuth: true
  }
});

const { data: me } = useMe();

const isModalOpen = ref(false);
const selectedPack = ref<BoosterPackCatalogEntry | null>(null);

const openPurchaseModal = (pack: BoosterPackCatalogEntry) => {
  selectedPack.value = pack;
  isModalOpen.value = true;
};
</script>

<template>
  <div v-if="me" class="shop-page">
    <AuthenticatedHeader />
    <main class="container">
      <header class="page-header">
        <h1>Shop</h1>
      </header>

      <section class="packs-catalog">
        <article
          v-for="entry in BOOSTER_PACKS_CATALOG"
          :key="entry.id"
          class="surface pack-card"
        >
          <header>
            <h2>
              {{ entry.name }}
            </h2>
            <p class="pack-price">
              {{ entry.packGoldCost }}
              <GodlIcon />
            </p>
            <p class="pack-details">{{ entry.packSize }} cards per pack</p>
          </header>

          <footer class="pack-actions">
            <FancyButton
              :disabled="me.wallet.gold < entry.packGoldCost || !entry.enabled"
              text="Buy Packs"
              @click="openPurchaseModal(entry)"
            />
          </footer>
        </article>
      </section>
    </main>

    <PurchaseBoosterModal
      v-model:is-opened="isModalOpen"
      :pack="selectedPack"
    />
  </div>
</template>

<style scoped lang="postcss">
.shop-page {
  min-height: 100vh;
  background: var(--surface-1);
}

.page-header {
  margin-block-end: var(--size-8);

  h1 {
    font-size: var(--font-size-6);
    font-weight: var(--font-weight-7);
    color: var(--text-1);
    margin-block-end: var(--size-3);
  }
}

.packs-catalog {
  display: grid;
  gap: var(--size-6);
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 400px), 1fr));
}

.pack-card {
  display: flex;
  flex-direction: column;
  gap: var(--size-5);

  > header {
    h2 {
      font-size: var(--font-size-5);
      font-weight: var(--font-weight-7);
      color: var(--text-1);
    }
  }

  > footer {
    display: flex;
    flex-wrap: wrap;
    gap: var(--size-3);
    margin-top: auto;
  }
}

.pack-details {
  font-size: var(--font-size-2);
  color: var(--text-2);
  margin-block-end: var(--size-2);
}

.pack-price {
  --pixel-scale: 1;
  font-size: var(--font-size-4);
  color: var(--primary);
  font-weight: var(--font-weight-6);
  display: flex;
  align-items: center;
}
</style>
