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

    <CountChip :count="size" class="count" />
  </div>
</template>

<style scoped lang="postcss">
.pile {
  display: grid;
  transform-style: preserve-3d;
  justify-self: center;
  position: relative;
  border: solid 1px black;
  > * {
    grid-column: 1;
    grid-row: 1;
  }
}

.pile-item {
  background: url('/assets/ui/card-back-small.png') no-repeat;
  background-size: contain;
  transform: translateZ(calc(var(--i) * 1px));
}

.count {
  bottom: 0;
  right: 0;
  position: absolute;
  z-index: 99;
  transform: translateZ(calc(v-bind(size) * 1px));
}
</style>
