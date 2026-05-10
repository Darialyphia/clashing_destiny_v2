<script setup lang="ts">
const { color = 'red' } = defineProps<{
  color?: 'red' | 'blue' | 'green' | 'yellow';
}>();
</script>

<template>
  <span class="trigger" :class="color"><slot /></span>
</template>

<style scoped lang="postcss">
.trigger {
  background: linear-gradient(
    to bottom,
    var(--top-color) 50%,
    var(--bottom-color) 50%
  );
  color: white;
  padding-inline: calc(6px * var(--pixel-scale));
  padding-block: calc(1px * var(--pixel-scale));
  font-size: 0.8em;
  clip-path: polygon(
    calc(3px * var(--pixel-scale)) 0%,
    100% 0%,
    calc(100% - 3px * var(--pixel-scale)) 100%,
    0% 100%
  );
  font-weight: 500;
  font-family: var(--font-system-ui);
  -webkit-text-stroke: calc(1.5px * var(--pixel-scale)) black;
  paint-order: stroke fill;
}

.red {
  --top-color: var(--red-7);
  --bottom-color: var(--red-10);
}

.blue {
  --top-color: var(--blue-7);
  --bottom-color: var(--blue-10);
}

.green {
  --top-color: var(--green-7);
  --bottom-color: var(--green-10);
}

.yellow {
  --top-color: var(--yellow-5);
  --bottom-color: var(--yellow-8);
  color: black;
}
</style>
