<script setup lang="ts">
import {
  CURRENCY_TYPES,
  type CurrencyType,
  type GetCatalogByCategoryOutput
} from '@game/api';
import { assets } from '@/assets';
import { match } from 'ts-pattern';
const { offer } = defineProps<{
  offer: GetCatalogByCategoryOutput['items'][number];
}>();
import GoldIcon from '@/player/components/GodlIcon.vue';
import CraftignShardIcon from '@/player/components/CraftignShardIcon.vue';
import PremiumGemIcon from '@/player/components/PremiumGemIcon.vue';
import UiModal from '@/ui/components/UiModal.vue';
import { useShopPurchase } from './useShop';
import FancyButton from '@/ui/components/FancyButton.vue';
import { useMe } from '@/auth/composables/useMe';
import { useToast } from '@/ui/composables/useToast';

const icon = computed(() => assets[`shop/${offer.icon}`]?.path);

const getCurrencyComponent = (currency: CurrencyType) => {
  return match(currency)
    .with(CURRENCY_TYPES.GOLD, () => GoldIcon)
    .with(CURRENCY_TYPES.CRAFTING_SHARDS, () => CraftignShardIcon)
    .with(CURRENCY_TYPES.PREMIUM, () => PremiumGemIcon)
    .exhaustive();
};

const isDetailsModalOpened = ref(false);
const { add: addToast } = useToast();
const { mutate: purchase, isLoading: isPurchasing } = useShopPurchase(() => {
  isDetailsModalOpened.value = false;
  addToast({
    title: 'Purchase Successful',
    variant: 'success'
  });
});

const quantity = ref(offer.quantity.min);
const currency = ref(offer.price[0].currency);

const { data: me } = useMe();

const selectedPrice = computed(
  () =>
    offer.price.find(price => price.currency === currency.value)?.amount ?? 0
);

const currentBalance = computed(() => {
  if (!me.value) return 0;

  return match(currency.value)
    .with(CURRENCY_TYPES.GOLD, () => me.value.wallet.gold)
    .with(CURRENCY_TYPES.CRAFTING_SHARDS, () => me.value.wallet.craftingShards)
    .with(CURRENCY_TYPES.PREMIUM, () => me.value.wallet.premium)
    .exhaustive();
});

const totalPrice = computed(() => selectedPrice.value * quantity.value);
const remainingBalance = computed(
  () => currentBalance.value - totalPrice.value
);
const hasQuantitySelector = computed(
  () => offer.quantity.max > offer.quantity.min
);
const canPurchase = computed(
  () =>
    offer.canPurchase &&
    quantity.value >= offer.quantity.min &&
    quantity.value <= offer.quantity.max &&
    totalPrice.value <= currentBalance.value
);

const normalizeQuantity = () => {
  const parsedQuantity = Number(quantity.value);

  quantity.value = Math.min(
    offer.quantity.max,
    Math.max(
      offer.quantity.min,
      Number.isFinite(parsedQuantity)
        ? Math.trunc(parsedQuantity)
        : offer.quantity.min
    )
  );
};

const isFree = computed(() => offer.price.every(price => price.amount === 0));
</script>

<template>
  <button
    class="offer-card"
    :class="{ unavailable: !offer.canPurchase }"
    @click="isDetailsModalOpened = true"
  >
    <div class="hot" v-if="offer.hot">Hot!</div>
    <img v-if="icon" :src="icon" :alt="offer.name" class="icon" />

    <div class="name">{{ offer.name }}</div>

    <div class="prices">
      <div v-if="isFree" class="free">Free</div>

      <template v-else>
        <div v-for="price in offer.price" :key="price.currency" class="price">
          <component
            :is="getCurrencyComponent(price.currency)"
            class="currency-icon"
          />
          {{ price.amount }}
        </div>
      </template>
    </div>
  </button>
  <UiModal
    v-if="me"
    v-model:is-opened="isDetailsModalOpened"
    :title="offer.name"
    description="Details about the offer"
  >
    <div class="purchase-modal surface">
      <div class="offer-details">
        <img v-if="icon" :src="icon" :alt="offer.name" class="modal-icon" />
        <div>
          <h2>{{ offer.name }}</h2>
          <p>{{ offer.description }}</p>
        </div>
      </div>

      <label v-if="offer.price.length > 1" class="field">
        <span>Pay with</span>
        <select v-model="currency">
          <option
            v-for="price in offer.price"
            :key="price.currency"
            :value="price.currency"
          >
            {{ price.currency }}
          </option>
        </select>
      </label>

      <div class="summary">
        <div class="summary-row">
          <span>Price per unit</span>
          <span class="currency-value">
            {{ selectedPrice }}
            <component
              :is="getCurrencyComponent(currency)"
              class="currency-icon"
            />
          </span>
        </div>
        <div v-if="hasQuantitySelector" class="summary-row quantity-row">
          <label for="offer-quantity">
            Quantity (max: {{ offer.quantity.max }})
          </label>
          <input
            id="offer-quantity"
            v-model.number="quantity"
            type="number"
            :min="offer.quantity.min"
            :max="offer.quantity.max"
            @input="normalizeQuantity"
          />
        </div>
        <div class="summary-row">
          <span>Current balance</span>
          <span class="currency-value">
            {{ currentBalance }}
            <component
              :is="getCurrencyComponent(currency)"
              class="currency-icon"
            />
          </span>
        </div>
        <div class="summary-row total-row">
          <span>Total deducted</span>
          <span class="currency-value">
            {{ totalPrice }}
            <component
              :is="getCurrencyComponent(currency)"
              class="currency-icon"
            />
          </span>
        </div>
        <div class="summary-row" :class="{ negative: remainingBalance < 0 }">
          <span>Remaining balance</span>
          <span class="currency-value">
            {{ remainingBalance }}
            <component
              :is="getCurrencyComponent(currency)"
              class="currency-icon"
            />
          </span>
        </div>
        <p v-if="remainingBalance < 0" class="error-message">
          You do not have enough currency for this purchase.
        </p>
      </div>

      <FancyButton
        :loading="isPurchasing"
        :disabled="!canPurchase"
        text="Purchase"
        @click="
          purchase({
            sku: offer.sku,
            quantity,
            currencyType: currency
          })
        "
      />
    </div>
  </UiModal>
</template>

<style scoped lang="postcss">
.offer-card {
  width: 200px;
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  --pixel-scale: 1;
  padding: var(--size-2) var(--size-3);
  border: solid 1px hsl(var(--color-primary-hsl) / 0.18);
  -webkit-text-stroke: 3px black;
  paint-order: stroke fill;
  background: linear-gradient(to top, #0004, transparent);
  border-radius: var(--size-2);
  position: relative;
  &:hover {
    box-shadow: 0 0 10px #fff8;
  }
  .hot {
    position: absolute;
    top: calc(-1 * var(--size-2));
    right: var(--size-2);
    background: var(--red-8);
    color: var(--text-1);
    padding: 0 var(--size-2);
    border-radius: var(--size-1);
    font-weight: var(--font-weight-7);
    font-size: var(--font-size-3);
    z-index: 1;
  }
}

.unavailable {
  &::after {
    content: 'You have already purchased this item.';
    position: absolute;
    inset: 0;
    backdrop-filter: grayscale(1);
    display: grid;
    place-items: center;
    padding: var(--size-2);
    font-size: var(--font-size-2);
    background: #0008;
  }
}

.icon {
  width: calc(107px * var(--pixel-scale));
  height: calc(108px * var(--pixel-scale));
  object-fit: contain;
  image-rendering: pixelated;
  filter: drop-shadow(0 8px 12px hsl(0 0% 0% / 0.55));
  transition: transform 0.25s ease;
  margin-inline: auto;
}

.name {
  margin-block-start: var(--size-3);
}

.prices {
  display: flex;
  justify-content: center;
  gap: var(--size-2);

  &:has(> div:nth-of-type(2)) {
    justify-content: space-between;
  }
}

.price {
  display: flex;
  align-items: center;
  font-size: var(--font-size-3);
  font-weight: var(--font-weight-7);
}

.purchase-modal {
  display: grid;
  gap: var(--size-4);
  min-width: min(440px, 80vw);
}

.offer-details {
  display: flex;
  align-items: center;
  gap: var(--size-4);
}

.modal-icon {
  width: 96px;
  height: 96px;
  object-fit: contain;
  image-rendering: pixelated;
}

.offer-details h2,
.offer-details p {
  margin: 0;
}

.offer-details p {
  margin-block-start: var(--size-2);
  color: var(--text-2);
}

.field,
.quantity-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--size-3);
}

.field select,
.quantity-row input {
  min-width: 120px;
  padding: var(--size-2);
  border: 1px solid var(--surface-4);
  background: var(--surface-1);
  color: var(--text-1);
}

.summary {
  display: grid;
  gap: var(--size-2);
  padding: var(--size-4);
  background: var(--surface-3);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  gap: var(--size-4);
}

.currency-value {
  display: inline-flex;
  align-items: center;
  gap: var(--size-1);
  font-weight: var(--font-weight-6);
}

.currency-icon {
  width: 1.25em;
  height: 1.25em;
}

.total-row {
  padding-block-start: var(--size-2);
  border-block-start: 1px solid var(--surface-4);
  font-weight: var(--font-weight-7);
}

.negative,
.error-message {
  color: var(--red-6);
}

.error-message {
  margin: var(--size-2) 0 0;
}

.free {
  font-size: var(--font-size-4);
  font-weight: var(--font-weight-7);
}
</style>
