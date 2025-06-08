<script setup lang="ts">
import { randomString } from '@game/shared';

const props = defineProps<{
  path: string;
  color: string;
}>();

const arrowHead = useTemplateRef('marker');
const markerId = randomString(6);
const markerUrl = `url(#${markerId})`;
</script>

<template>
  <svg class="w-full h-full">
    <defs>
      <marker
        ref="marker"
        :id="markerId"
        markerWidth="13"
        markerHeight="13"
        :refX="2"
        :refY="6"
        orient="auto"
      >
        <path d="M 2 2 L 2 9 L 7 6 L 2 4" class="arrow-head" />
      </marker>
    </defs>
    <path class="path" :d="props.path" />
  </svg>
</template>

<style scoped lang="postcss">
.path {
  stroke: v-bind(color);
  stroke-width: 10px;
  fill: none;
  marker-end: v-bind(markerUrl);
}

.arrow-head {
  fill: v-bind(color);
}
</style>
