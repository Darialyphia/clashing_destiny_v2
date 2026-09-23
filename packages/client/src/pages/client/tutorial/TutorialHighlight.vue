<script setup lang="ts">
import { useElementBounding } from '@vueuse/core';
import { useTutorial } from './useTutorial';

const { client } = useTutorial();

const rect = useElementBounding(
  computed(() => client.value.ui.highlightedElement)
);
const RECT_PADDING = 15;
</script>

<template>
  <div
    class="highlight"
    v-if="client.ui.highlightedElement"
    :style="{
      '--left': `${rect.left.value - RECT_PADDING}`,
      '--top': `${rect.top.value - RECT_PADDING}`,
      '--width': `${rect.width.value + RECT_PADDING * 2}`,
      '--height': `${rect.height.value + RECT_PADDING * 2}`
    }"
  />
</template>

<style scoped lang="postcss">
@keyframes highlight-pulse {
  50% {
    backdrop-filter: brightness(1.5);
  }
}

.highlight {
  position: fixed;
  inset: 0;
  width: 1px;
  height: 1px;
  pointer-events: none;
  box-shadow: 0 0 0 100vmax hsl(0 0 0 / 0.5);
  translate: calc(1px * var(--left)) calc(1px * var(--top));
  scale: calc(var(--width)) calc(var(--height));
  transform-origin: top left;
  transform:
    translate 0.5s var(--ease-3),
    scale 0.5s var(--ease-3);
  animation: highlight-pulse 2s infinite;
}
</style>
