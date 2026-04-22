<script setup lang="ts"></script>

<template>
  <span class="job-bonus"><slot /></span>
</template>

<style scoped lang="postcss">
.job-bonus {
  background: linear-gradient(
    to bottom,
    var(--indigo-4) 50%,
    var(--indigo-6) 50%
  );
  border: solid calc(0.5px * var(--pixel-scale)) var(--indigo-8);
  color: white;
  font-size: 0.95em;
  padding-inline: calc(4px * var(--pixel-scale));
  border-radius: var(--radius-pill);
  font-family: var(--font-system-ui);
  font-weight: var(--font-weight-5);
  -webkit-text-stroke: calc(1.5px * var(--pixel-scale)) black;
  paint-order: stroke fill;
  padding-bottom: calc(1px * var(--pixel-scale));
}
</style>
