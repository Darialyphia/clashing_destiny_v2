<script setup lang="ts">
import { randomString } from '@game/shared';

const props = defineProps<{
  path: string;
  color: string;
}>();

const markerId = randomString(6);
const markerUrl = `url(#${markerId})`;

const path = useTemplateRef<SVGPathElement>('path');
const length = computed(() => path.value?.getTotalLength() ?? 0);
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
    </defs>
    <path class="path" :d="props.path" ref="path" />
  </svg>
</template>

<style scoped lang="postcss">
.path {
  stroke: v-bind(color);
  stroke-width: 10px;
  fill: none;
  marker-end: v-bind(markerUrl);
  stroke-dasharray: v-bind(length);
  stroke-dashoffset: v-bind(length);
  animation: arrow-dash 0.3s var(--ease-in-2) forwards;
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
