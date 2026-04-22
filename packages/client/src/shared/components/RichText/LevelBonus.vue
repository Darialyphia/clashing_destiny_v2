<script setup lang="ts">
const { lvl } = defineProps<{
  lvl: number;
}>();
</script>

<template>
  <span class="lvl-bonus">Level {{ lvl }}</span>
</template>

<style scoped lang="postcss">
.lvl-bonus {
  background: linear-gradient(
    to bottom,
    var(--yellow-4) 50%,
    var(--yellow-6) 50%
  );
  border: solid calc(0.5px * var(--pixel-scale)) var(--yellow-8);
  color: black;
  font-size: 0.95em;
  padding-inline: calc(4px * var(--pixel-scale));
  border-radius: var(--radius-pill);
  font-family: var(--font-system-ui);
  font-weight: var(--font-weight-5);
  -webkit-text-stroke: calc(1px * var(--pixel-scale)) white;
  paint-order: stroke fill;
}
</style>
