<script setup lang="ts">
import { useMe } from '@/auth/composables/useMe';
import { usePurchaseBoosterPacks } from '@/card/composables/useBoosterPack';
import type { BoosterPackCatalogEntry } from '@game/api';

const { pack } = defineProps<{
  pack: BoosterPackCatalogEntry | null;
}>();

const isOpened = defineModel<boolean>('isOpened');

const { mutate: buyPack, isLoading: isBuyingPack } = usePurchaseBoosterPacks(
  () => {
    isOpened.value = false;
  }
);

const { data: me } = useMe();
const quantity = ref(1);

const maxQuantity = computed(() => {
  if (!pack || !me.value) return 0;
  return Math.floor(me.value.wallet.gold / pack.packGoldCost);
});

const totalCost = computed(() => {
  if (!pack) return 0;
  return pack.packGoldCost * quantity.value;
});

const setMaxQuantity = () => {
  quantity.value = maxQuantity.value;
};

const handlePurchase = () => {
  if (!pack) return;
  buyPack({ packType: pack.id, quantity: quantity.value });
};
</script>

<template>
  <UiModal
    v-model:is-opened="isOpened"
    title="Purchase Booster Packs"
    description="Select the number of packs you want to purchase"
  >
    <div v-if="pack" class="purchase-modal surface">
      <div class="modal-header">
        <h2>{{ pack.name }}</h2>
        <p class="pack-info">
          {{ pack.packGoldCost }}
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
        <UiButton :disabled="isBuyingPack" @click="isOpened = false">
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
</template>

<style scoped lang="postcss">
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
