<script setup lang="ts">
import FancyButton from '@/ui/components/FancyButton.vue';
import PageTitle from '@/shared/components/PageTitle.vue';
import GiftsList from './GiftsList.vue';
import { provideGiftsPage } from './useGiftsPage';

definePage({
  name: 'Gifts',
  meta: {
    wrapperClass: 'page-blur'
  }
});

const { claimableGifts, isClaiming, claimAll } = provideGiftsPage();
</script>

<template>
  <div class="gifts-page">
    <FancyButton
      class="back-button"
      text="Back"
      size="md"
      :to="{ name: 'ClientHome' }"
    />

    <PageTitle title="Gifts" />

    <FancyButton
      class="redeem-all-button"
      :text="
        claimableGifts.length > 0
          ? `Redeem All (${claimableGifts.length})`
          : 'All gifts claumed'
      "
      :disabled="claimableGifts.length === 0"
      :is-loading="isClaiming"
      @click="claimAll"
    >
      <template #left>
        <span class="i-mdi-gift" />
      </template>
    </FancyButton>

    <GiftsList />
  </div>
</template>

<style scoped lang="postcss">
.gifts-page {
  position: relative;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  gap: var(--size-3);
  height: 100dvh;
  padding: var(--size-6) var(--size-8) var(--size-6);
  overflow: hidden;
}

.back-button {
  position: absolute;
  top: var(--size-6);
  left: var(--size-8);
  z-index: 1;
}

.redeem-all-button {
  position: absolute;
  top: var(--size-9);
  right: var(--size-8);
  z-index: 1;
}
</style>
