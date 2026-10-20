<script setup lang="ts">
import { useMe } from '@/auth/composables/useMe';
import GodlIcon from './GodlIcon.vue';
import PremiumGemIcon from './PremiumGemIcon.vue';

const { data: me } = useMe();
</script>

<template>
  <div v-if="me" class="currencies">
    <GodlIcon />
    <span class="dual-text" :data-text="me.wallet.gold">
      {{ me.wallet.gold }}
    </span>
    <PremiumGemIcon />
    <span class="dual-text" :data-text="me.wallet.premium">
      {{ me.wallet.premium }}
    </span>
  </div>
</template>

<style scoped lang="postcss">
.currencies {
  --pixel-scale: 1;
  display: flex;
  align-items: center;
  gap: var(--size-2);
  font-size: var(--font-size-3);
  --dual-text-stroke-offset-y: calc(-1px * var(--pixel-scale));
  background: #000000aa;
  padding: var(--size-2) var(--size-3);
  border-radius: var(--radius-pill);
}
</style>
