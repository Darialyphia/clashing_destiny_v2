<script setup lang="ts">
import { randomString } from '@game/shared';

const props = defineProps<{
  path: string;
  color: string;
}>();

const markerId = randomString(6);
const markerUrl = `url(#${markerId})`;
const shadowId = randomString(6);
const shadowUrl = `url(#${shadowId})`;
</script>

<template>
  <svg class="w-full h-full">
    <defs>
      <marker
        :id="markerId"
        markerWidth="13"
        markerHeight="13"
        :refX="2"
        :refY="6"
        orient="auto"
      >
        <path d="M 2 2 L 2 9 L 7 6 L 2 3" class="arrow-head" />
      </marker>
      <filter :id="shadowId">
        <feDropShadow dx="0.2" dy="0.4" stdDeviation="0.2" />
      </filter>
    </defs>
    <path class="path" :d="props.path" :filter="shadowUrl" />
  </svg>
</template>

<style scoped lang="postcss">
.path {
  stroke: v-bind(color);
  stroke-width: 5px;
  fill: none;
  marker-end: v-bind(markerUrl);
  animation: arrow-dash 0.3s var(--ease-in-2) forwards;
  opacity: 0.75;
}

.arrow-head {
  fill: v-bind(color);
  animation: arrow-head 0.2s var(--ease-in-2) forwards;
  animation-delay: 0.3s;
  opacity: 0;
}

@keyframes arrow-dash {
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes arrow-head {
  to {
    opacity: 1;
  }
}
</style>
