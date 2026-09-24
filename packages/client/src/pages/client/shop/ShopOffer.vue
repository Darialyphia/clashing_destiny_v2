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

const icon = computed(() => assets[`shop/${offer.icon}`]?.path);

const getCurrencyComponent = (currency: CurrencyType) => {
  return match(currency)
    .with(CURRENCY_TYPES.GOLD, () => GoldIcon)
    .with(CURRENCY_TYPES.CRAFTING_SHARDS, () => CraftignShardIcon)
    .with(CURRENCY_TYPES.PREMIUM, () => PremiumGemIcon)
    .exhaustive();
};

const isDetailsModalOpened = ref(false);
</script>

<template>
  <button
    class="offer-card"
    :class="{ unavailable: !offer.canPurchase }"
    @click="isDetailsModalOpened = true"
  >
    <img v-if="icon" :src="icon" :alt="offer.name" class="icon" />

    <div class="name">{{ offer.name }}</div>

    <div class="prices">
      <div v-for="price in offer.price" :key="price.currency" class="price">
        <component
          :is="getCurrencyComponent(price.currency)"
          class="currency-icon"
        />
        {{ price.amount }}
      </div>
    </div>
  </button>
  <UiModal
    v-model:is-opened="isDetailsModalOpened"
    :title="offer.name"
    description="Details about the offer"
  >
    <div class="surface">TODO</div>
  </UiModal>
</template>

<style scoped lang="postcss">
.offer-card {
  width: 200px;
  aspect-ratio: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  --pixel-scale: 1;
  padding: var(--size-2) var(--size-3);
  border: solid 1px hsl(var(--color-primary-hsl) / 0.18);
  -webkit-text-stroke: 3px black;
  paint-order: stroke fill;
  background: linear-gradient(to top, #0004, transparent);
  border-radius: var(--size-2);
  &:hover {
    box-shadow: 0 0 10px #fff8;
  }
}

.unavailable {
  filter: saturate(0.45);
  opacity: 0.72;
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
</style>
