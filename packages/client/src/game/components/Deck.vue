<script setup lang="ts">
import Pile from './Pile.vue';
const { size, offset } = defineProps<{
  size: number;
  offset: { x: number; y: number; z: number };
}>();
</script>

<template>
  <Pile :size="size" :offset="offset" class="deck">
    <div class="card" />
  </Pile>
</template>

<style scoped lang="postcss">
.deck {
  height: calc(var(--pixel-scale) * var(--card-v3-height));
  width: calc(var(--pixel-scale) * var(--card-v3-width));
}

.card {
  background: url('@/assets/ui/card/v3/card-back.png') no-repeat;
  background-size: contain;
  width: calc(var(--pixel-scale) * var(--card-v3-width));
  aspect-ratio: var(--card-v3-ratio);
}
</style>
