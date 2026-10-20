<script setup lang="ts">
import FancyButton from '@/ui/components/FancyButton.vue';
import GiftContentItem from './GiftContentItem.vue';
import { useGiftsPage, type Gift } from './useGiftsPage';

const { gift } = defineProps<{ gift: Gift }>();

const { canClaim, claim, isClaimingGift, formatTimeAgo, getItems } =
  useGiftsPage();

const items = computed(() => getItems(gift));
</script>

<template>
  <article class="gift-row">
    <!-- Missing asset: gift illustration -->
    <div class="gift-art" />

    <div class="gift-info">
      <h3>{{ gift.name }}</h3>
      <p v-if="gift.description" class="description">
        {{ gift.description }}
      </p>
      <div class="received-at">
        <span class="i-mdi-clock-outline" />
        {{ formatTimeAgo(gift.receivedAt) }}
      </div>
    </div>

    <section class="contents">
      <div class="items">
        <GiftContentItem v-for="item in items" :key="item.key" :item="item" />
      </div>
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
  grid-template-columns: 9rem minmax(0, 17rem) minmax(0, 1fr) 14rem;
  align-items: center;
  gap: var(--size-4);
  padding: var(--size-2) var(--size-5) var(--size-2) var(--size-3);
  border: 2px solid #8a6a2f;
  box-shadow:
    inset 0 0 0 3px #0c0a14,
    inset 0 0 0 4px #5b4521;
}

.gift-art {
  height: 7rem;
  background: radial-gradient(circle, #e05cc4, #5b2a86 60%, transparent 75%);
}

.gift-info {
  display: flex;
  flex-direction: column;
  gap: var(--size-1);

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

.contents {
  position: relative;
  align-self: stretch;
  padding: var(--size-2) var(--size-3);
  background: hsl(0 0% 0% / 0.3);
  border: 1px solid hsl(0 0% 100% / 0.08);
  border-radius: var(--radius-2);
  background: linear-gradient(90deg, #1d1630, #120e1d 60%);
}

.items {
  display: flex;
  justify-content: flex-start;
  gap: var(--size-3);
  padding-left: 7rem;
}

.redeem-button {
  justify-self: end;
  width: 100%;
}
</style>
