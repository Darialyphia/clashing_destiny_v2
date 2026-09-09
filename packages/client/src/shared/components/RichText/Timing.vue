<script setup lang="ts"></script>

<template>
  <span class="timing">
    <slot />
  </span>
</template>

<style scoped lang="postcss">
.timing {
  background: linear-gradient(
    to bottom,
    hsl(var(--yellow-5-hsl) / 0.6) 50%,
    hsl(var(--yellow-7-hsl) / 0.6) 50%
  );
  border: solid calc(0.5px * var(--pixel-scale)) hsl(var(--yellow-9-hsl) / 0.6);
  color: white;
  font-size: 0.9em;
  padding-inline: calc(4px * var(--pixel-scale));
  padding-bottom: calc(1px * var(--pixel-scale));
  border-radius: var(--radius-pill);
  font-family: var(--font-system-ui);
  font-weight: var(--font-weight-5);
  -webkit-text-stroke: calc(1.5px * var(--pixel-scale)) black;
  paint-order: stroke fill;
  margin-right: 1ch;
}
</style>
