<script setup lang="ts">
import FancyButton from '@/ui/components/FancyButton.vue';
import GiftContentItem from './GiftContentItem.vue';
import { useGiftsPage, type Gift } from './useGiftsPage';
import { Icon } from '@iconify/vue';
import { assets } from '@/assets';

const { gift } = defineProps<{ gift: Gift }>();

const { canClaim, claim, isClaimingGift, formatTimeAgo, getItems } =
  useGiftsPage();

const items = computed(() => getItems(gift));
</script>

<template>
  <article class="gift-row surface">
    <div
      class="gift-art"
      :style="{ '--bg': gift.icon ? assets[`icons/${gift.icon}`].css : '' }"
    />

    <div class="gift-info">
      <h3>{{ gift.name }}</h3>
      <p v-if="gift.description" class="description">
        {{ gift.description }}
      </p>
      <div class="received-at">
        <Icon icon="mdi-clock-outline" class="received-at-icon" />
        {{ formatTimeAgo(gift.receivedAt) }}
      </div>
    </div>

    <section class="gift-contents fancy-scrollbar">
      <GiftContentItem v-for="item in items" :key="item.key" :item="item" />
    </section>

    <FancyButton
      class="redeem-button"
      size="md"
      :text="canClaim(gift) ? 'Redeem' : 'Claimed'"
      :disabled="!canClaim(gift)"
      :is-loading="isClaimingGift(gift.id)"
      @click="claim(gift.id)"
    />
  </article>
</template>

<style scoped lang="postcss">
.gift-row {
  position: relative;
  display: grid;
  grid-template-columns: 9rem minmax(0, 24rem) minmax(0, 1fr) 10rem;
  gap: var(--size-4);
}

.gift-art {
  height: 128px;
  aspect-ratio: 1 / 1;
  background: var(--bg);
  background-size: cover;
  background-position: center;
  justify-self: center;
  align-self: center;
}

.gift-info {
  display: flex;
  flex-direction: column;
  gap: var(--size-1);
  align-self: center;

  h3 {
    font-family: 'Cinzel Decorative', serif;
    font-size: var(--font-size-3);
    font-weight: var(--font-weight-7);
    color: #f8eabb;
  }

  .description {
    font-size: var(--font-size-1);
    color: var(--text-2);
  }
}

.received-at {
  display: flex;
  align-items: center;
  gap: var(--size-2);
  font-size: var(--font-size-0);
  color: #b9b0c9;
}

.received-at-icon {
  color: var(--primary);
  font-size: var(--font-size-4);
}

.gift-contents {
  padding: 0 var(--size-3) var(--size-2);
  border-radius: var(--radius-2);
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: var(--size-7);
  overflow-x: auto;
}

.redeem-button {
  justify-self: end;
  width: 100%;
  align-self: center;
}
</style>
