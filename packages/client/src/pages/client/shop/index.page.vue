<script setup lang="ts">
import { useAuthedMutation } from '@/auth/composables/useAuth';
import { useMe } from '@/auth/composables/useMe';
import AuthenticatedHeader from '@/AuthenticatedHeader.vue';
import GodlIcon from '@/player/components/GodlIcon.vue';
import FancyButton from '@/ui/components/FancyButton.vue';
import UiSpinner from '@/ui/components/UiSpinner.vue';
import { api, BOOSTER_PACKS_CATALOG } from '@game/api';

definePage({
  name: 'Shop',
  path: '/client/shop',
  meta: {
    requiresAuth: true
  }
});

const { mutate: buyPack, isLoading: isBuyingPack } = useAuthedMutation(
  api.cards.purchasePacks
);

const { data: me } = useMe();
</script>

<template>
  <div v-if="me" class="shop-page">
    <AuthenticatedHeader />
    <main class="container">
      <header class="page-header">
        <h1>Shop</h1>
        <p class="balance">
          Available Gold:
          <strong>{{ me.wallet.gold }}</strong>
        </p>
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
            <UiSpinner v-if="isBuyingPack" size="7" class="mx-auto" />
            <template v-else>
              <FancyButton
                :disabled="
                  me.wallet.gold < entry.packGoldCost ||
                  isBuyingPack ||
                  !entry.enabled
                "
                text="Buy 1 Pack"
                @click="buyPack({ packType: entry.id, quantity: 1 })"
              />

              <FancyButton
                :disabled="
                  me.wallet.gold < entry.packGoldCost ||
                  isBuyingPack ||
                  !entry.enabled
                "
                :text="`Buy Max (${Math.floor(me.wallet.gold / entry.packGoldCost)})`"
                @click="
                  buyPack({
                    packType: entry.id,
                    quantity: Math.floor(me.wallet.gold / entry.packGoldCost)
                  })
                "
              />
            </template>
          </footer>
        </article>
      </section>
    </main>
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

.balance {
  font-size: var(--font-size-3);
  color: var(--text-2);

  strong {
    color: var(--primary);
    font-weight: var(--font-weight-7);
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
