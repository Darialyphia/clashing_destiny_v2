<script setup lang="ts">
import Pile from './Pile.vue';
const { size } = defineProps<{ size: number }>();
</script>

<template>
  <Pile :size="size">
    <div class="card" />
  </Pile>
</template>

<style scoped lang="postcss">
.card {
  background: url('/assets/ui/card-back-small.png') no-repeat;
  background-size: contain;
  width: var(--card-small-width);
  aspect-ratio: var(--card-small-ratio);
}
</style>
