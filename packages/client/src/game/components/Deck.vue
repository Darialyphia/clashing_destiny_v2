<script setup lang="ts">
import Pile from './Pile.vue';
const { size } = defineProps<{ size: number }>();
</script>

<template>
  <Pile :size="size" class="deck">
    <div class="card" />
  </Pile>
</template>

<style scoped lang="postcss">
.deck {
  height: calc(var(--pixel-scale) * var(--card-small-height));
  width: calc(var(--pixel-scale) * var(--card-small-width));
  --pixel-scale: 1;
  @screen lt-lg {
    --pixel-scale: 0.5;
  }
}

.card {
  background: url('@/assets/ui/card/card_backs/default-small.png') no-repeat;
  background-size: contain;
  width: calc(var(--pixel-scale) * var(--card-small-width));
  aspect-ratio: var(--card-small-ratio);
}
</style>
