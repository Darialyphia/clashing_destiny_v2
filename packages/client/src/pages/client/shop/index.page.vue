<script setup lang="ts">
import { useAuthedMutation } from '@/auth/composables/useAuth';
import { useMe } from '@/auth/composables/useMe';
import AuthenticatedHeader from '@/AuthenticatedHeader.vue';
import GodlIcon from '@/player/components/GodlIcon.vue';
import FancyButton from '@/ui/components/FancyButton.vue';
import UiModal from '@/ui/components/UiModal.vue';
import UiButton from '@/ui/components/UiButton.vue';
import {
  api,
  BOOSTER_PACKS_CATALOG,
  type BoosterPackCatalogEntry
} from '@game/api';

definePage({
  name: 'Shop',
  path: '/client/shop',
  meta: {
    requiresAuth: true
  }
});

const { mutate: buyPack, isLoading: isBuyingPack } = useAuthedMutation(
  api.cards.purchasePacks,
  {
    onSuccess: () => {
      isModalOpen.value = false;
    }
  }
);

const { data: me } = useMe();

// Modal state
const isModalOpen = ref(false);
const selectedPack = ref<BoosterPackCatalogEntry | null>(null);
const quantity = ref(1);

const openPurchaseModal = (pack: BoosterPackCatalogEntry) => {
  selectedPack.value = pack;
  quantity.value = 1;
  isModalOpen.value = true;
};

const maxQuantity = computed(() => {
  if (!selectedPack.value || !me.value) return 0;
  return Math.floor(me.value.wallet.gold / selectedPack.value.packGoldCost);
});

const totalCost = computed(() => {
  if (!selectedPack.value) return 0;
  return selectedPack.value.packGoldCost * quantity.value;
});

const setMaxQuantity = () => {
  quantity.value = maxQuantity.value;
};

const handlePurchase = () => {
  if (!selectedPack.value) return;
  buyPack({ packType: selectedPack.value.id, quantity: quantity.value });
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
              :disabled="
                me.wallet.gold < entry.packGoldCost ||
                isBuyingPack ||
                !entry.enabled
              "
              text="Buy Packs"
              @click="openPurchaseModal(entry)"
            />
          </footer>
        </article>
      </section>
    </main>

    <!-- Purchase Modal -->
    <UiModal
      v-model:is-opened="isModalOpen"
      title="Purchase Booster Packs"
      description="Select the number of packs you want to purchase"
    >
      <div v-if="selectedPack" class="purchase-modal surface">
        <div class="modal-header">
          <h2>{{ selectedPack.name }}</h2>
          <p class="pack-info">
            {{ selectedPack.packGoldCost }}
            <GodlIcon />
            per pack
          </p>
        </div>

        <div class="quantity-selector">
          <label for="quantity">Quantity:</label>
          <div class="quantity-controls">
            <UiButton
              class="primary-button"
              :disabled="quantity <= 1"
              @click="quantity = Math.max(1, quantity - 1)"
            >
              -
            </UiButton>
            <input
              id="quantity"
              v-model.number="quantity"
              type="number"
              min="1"
              :max="maxQuantity"
              class="quantity-input"
            />
            <UiButton
              class="primary-button"
              :disabled="quantity >= maxQuantity"
              @click="quantity = Math.min(maxQuantity, quantity + 1)"
            >
              +
            </UiButton>
            <UiButton class="primary-button" @click="setMaxQuantity">
              Max ({{ maxQuantity }})
            </UiButton>
          </div>
        </div>

        <div class="purchase-summary">
          <div class="summary-row">
            <span>Total Cost:</span>
            <span class="cost">
              {{ totalCost }}
              <GodlIcon />
            </span>
          </div>
          <div class="summary-row">
            <span>Your Balance:</span>
            <span>
              {{ me.wallet.gold }}
              <GodlIcon />
            </span>
          </div>
          <div class="summary-row">
            <span>After Purchase:</span>
            <span :class="{ 'text-error': me.wallet.gold - totalCost < 0 }">
              {{ me.wallet.gold - totalCost }}
              <GodlIcon />
            </span>
          </div>
        </div>

        <div class="modal-actions">
          <UiButton :disabled="isBuyingPack" @click="isModalOpen = false">
            Cancel
          </UiButton>
          <FancyButton
            :disabled="
              quantity < 1 ||
              quantity > maxQuantity ||
              totalCost > me.wallet.gold ||
              isBuyingPack
            "
            :text="
              isBuyingPack
                ? 'Processing...'
                : `Purchase ${quantity} Pack${quantity > 1 ? 's' : ''}`
            "
            @click="handlePurchase"
          />
        </div>
      </div>
    </UiModal>
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

.purchase-modal {
  --pixel-scale: 1;
  background: var(--surface-2);
  padding: var(--size-6);
  border-radius: var(--radius-3);
  display: flex;
  flex-direction: column;
  gap: var(--size-5);
}

.modal-header {
  h2 {
    font-size: var(--font-size-5);
    font-weight: var(--font-weight-7);
    color: var(--text-1);
    margin-block-end: var(--size-2);
  }

  .pack-info {
    font-size: var(--font-size-3);
    color: var(--text-2);
    display: flex;
    align-items: center;
    gap: var(--size-1);
  }
}

.quantity-selector {
  display: flex;
  flex-direction: column;
  gap: var(--size-3);

  label {
    font-size: var(--font-size-3);
    font-weight: var(--font-weight-6);
    color: var(--text-1);
  }
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: var(--size-3);
  flex-wrap: wrap;
}

.quantity-input {
  width: 80px;
  padding: var(--size-2);
  font-size: var(--font-size-3);
  text-align: center;
  border: 2px solid var(--surface-4);
  border-radius: var(--radius-2);
  background: var(--surface-1);
  color: var(--text-1);

  &:focus {
    outline: none;
    border-color: var(--primary);
  }

  /* Remove spinner arrows */
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  &[type='number'] {
    -moz-appearance: textfield;
  }
}

.purchase-summary {
  background: var(--surface-3);
  padding: var(--size-4);
  border-radius: var(--radius-2);
  display: flex;
  flex-direction: column;
  gap: var(--size-3);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--font-size-2);

  &:first-child {
    font-size: var(--font-size-3);
    font-weight: var(--font-weight-6);
  }

  span {
    color: var(--text-2);
    display: flex;
    align-items: center;
    gap: var(--size-1);
  }

  .cost {
    color: var(--primary);
    font-weight: var(--font-weight-6);
  }

  .text-error {
    color: var(--red-6);
  }
}

.modal-actions {
  display: flex;
  gap: var(--size-3);
  justify-content: flex-end;
  margin-top: var(--size-3);
}
</style>
