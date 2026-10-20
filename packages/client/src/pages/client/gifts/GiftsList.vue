<script setup lang="ts">
import GiftRow from './GiftRow.vue';
import { useGiftsPage } from './useGiftsPage';

const { gifts, claimableGifts, isLoading } = useGiftsPage();
</script>

<template>
  <section class="gifts-list">
    <header>
      <span class="i-mdi-gift" />
      {{ claimableGifts.length }} unclaimed
      {{ claimableGifts.length === 1 ? 'Gift' : 'Gifts' }}
    </header>

    <div v-if="isLoading" class="state">Loading your gifts...</div>
    <div v-else-if="gifts.length === 0" class="state">
      You have no gifts at the moment.
    </div>
    <div v-else class="rows fancy-scrollbar">
      <GiftRow v-for="gift in gifts" :key="gift.id" :gift="gift" />
    </div>
  </section>
</template>

<style scoped lang="postcss">
.gifts-list {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  gap: var(--size-2);
  min-height: 0;
  padding: var(--size-3);
}

header {
  display: flex;
  align-items: center;
  gap: var(--size-2);
  padding-inline: var(--size-5);
  font-weight: var(--font-weight-6);
  color: var(--text-1);

  [class^='i-'] {
    color: #d7ad42;
    font-size: var(--font-size-3);
  }
}

.rows {
  display: flex;
  flex-direction: column;
  gap: var(--size-5);
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
}

.state {
  display: grid;
  place-items: center;
  color: var(--text-2);
}
</style>
