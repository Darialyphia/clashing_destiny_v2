<script setup lang="ts">
import { assets } from '@/assets';
import BlueprintCard from '@/card/components/BlueprintCard.vue';
import GoldIcon from '@/player/components/GodlIcon.vue';
import CraftingShardIcon from '@/player/components/CraftingShardIcon.vue';
import { HoverCardContent, HoverCardRoot, HoverCardTrigger } from 'reka-ui';
import type { GiftItem } from './useGiftsPage';

const { item } = defineProps<{ item: GiftItem }>();

const cardArt = computed(() =>
  item.kind === 'card' && item.blueprint
    ? assets[`cards/${item.blueprint.art.default.main}`]?.path
    : undefined
);
</script>

<template>
  <div class="gift-content-item">
    <HoverCardRoot
      :open-delay="0"
      :close-delay="0"
      :disabled="item.kind !== 'card' || !item.blueprint"
    >
      <HoverCardTrigger as-child>
        <div class="tile">
          <GoldIcon v-if="item.kind === 'gold'" />
          <CraftingShardIcon v-else-if="item.kind === 'dust'" />
          <div
            v-else-if="item.kind === 'card' && cardArt"
            class="card-art"
            :style="{ backgroundImage: `url(${cardArt})` }"
          />
          <!-- Missing asset: booster pack / deck icon -->
          <div v-else class="asset-placeholder" />
          <span class="amount-badge">x{{ item.amount }}</span>
        </div>
      </HoverCardTrigger>
      <HoverCardContent v-if="item.kind === 'card' && item.blueprint" side="right">
        <BlueprintCard :blueprint="item.blueprint" />
      </HoverCardContent>
    </HoverCardRoot>
    <div class="label">{{ item.label }}</div>
    <div class="amount">x{{ item.amount }}</div>
  </div>
</template>

<style scoped lang="postcss">
.gift-content-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 6.5rem;
  text-align: center;
  font-size: var(--font-size-00);
  line-height: 1.2;
  color: var(--text-2);
}

.tile {
  position: relative;
  display: grid;
  place-items: center;
  width: 4rem;
  height: 4rem;
  margin-bottom: var(--size-1);
  background: hsl(0 0% 0% / 0.35);
  border-radius: var(--radius-2);
}

.card-art,
.asset-placeholder {
  width: 80%;
  height: 80%;
  background-size: cover;
  background-position: center;
}

.asset-placeholder {
  background: linear-gradient(135deg, #7c4dff, #ff5ca8);
  border-radius: var(--radius-1);
}

.amount-badge {
  position: absolute;
  right: -0.25rem;
  bottom: -0.1rem;
  padding: 0 var(--size-1);
  font-size: var(--font-size-0);
  font-weight: var(--font-weight-7);
  color: #f8eabb;
  background: #0c0a14;
  border: 1px solid #c79a3b;
  border-radius: var(--radius-1);
}

.label {
  color: #ddd5e8;
}

.amount {
  color: #b9b0c9;
}
</style>
