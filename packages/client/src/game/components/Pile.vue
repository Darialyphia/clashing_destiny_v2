<script setup lang="ts">
const { size, offset } = defineProps<{
  size: number;
  offset: { x: number; y: number; z: number };
}>();
</script>

<template>
  <div
    class="pile"
    :style="{
      '--offset-x': offset.x + 'px',
      '--offset-y': offset.y + 'px',
      '--offset-z': offset.z + 'px'
    }"
  >
    <div v-for="i in size" :key="i" class="pile-item" :style="{ '--i': i - 1 }">
      <slot :index="i - 1" />
    </div>
  </div>
</template>

<style scoped lang="postcss">
.pile {
  display: grid;
  transform-style: preserve-3d;
  justify-self: center;
  position: relative;
  border: solid 1px hsl(from #985e25 h s l / 0.5);
  height: calc(var(--pixel-scale) * var(--card-small-height));
  width: calc(var(--pixel-scale) * var(--card-small-width));
  > * {
    grid-column: 1;
    grid-row: 1;
  }
}

.pile-item {
  background-size: contain;
  transform: translateZ(calc(var(--i) * var(--offset-z)))
    translateX(calc(var(--i) * var(--offset-x)))
    translateY(calc(var(--i) * var(--offset-y)));
}
</style>
