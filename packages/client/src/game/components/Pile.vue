<script setup lang="ts">
import CountChip from './CountChip.vue';

const { size } = defineProps<{ size: number }>();

const maxSize = 25;
</script>

<template>
  <div class="pile">
    <div
      v-for="i in Math.min(size, maxSize)"
      :key="i"
      class="pile-item"
      :style="{ '--i': i - 1 }"
    >
      <slot :index="i - 1" />
    </div>

    <CountChip :count="size" class="absolute bottom-0 right-0" />
  </div>
</template>

<style scoped lang="postcss">
.pile {
  display: grid;
  transform-style: preserve-3d;
  justify-self: center;
  position: relative;
  > * {
    grid-column: 1;
    grid-row: 1;
  }
}

.pile-item {
  background: url('/assets/ui/card-back-small.png') no-repeat;
  background-size: contain;
  transform: translateY(calc(var(--i) * -1px));
}
</style>
