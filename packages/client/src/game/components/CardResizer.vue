<script setup lang="ts">
import { isDefined } from '@game/shared';
import { useResizeObserver } from '@vueuse/core';

const { enabled = true, forcedScale } = defineProps<{
  enabled?: boolean;
  forcedScale?: number;
}>();

const root = useTemplateRef('root');

const scale = ref(1);
const calculateScale = () => {
  if (!root.value) return;
  if (!enabled) {
    scale.value = 1;
    return;
  }
  if (isDefined(forcedScale)) {
    scale.value = forcedScale;
    return;
  }
  const availableWidth = root.value.parentElement?.clientWidth || 0;
  const availableHeight = root.value.parentElement?.clientHeight || 0;
  const width = root.value.offsetWidth;
  const height = root.value.offsetHeight;
  const scaleX = availableWidth / width;
  const scaleY = availableHeight / height;
  scale.value = Math.min(scaleX, scaleY);
};

useResizeObserver(root, calculateScale);
useResizeObserver(
  computed(() => root.value?.parentElement),
  calculateScale
);
onMounted(calculateScale);
</script>

<template>
  <div class="card-resizer" ref="root">
    <slot />
  </div>
</template>

<style scoped lang="postcss">
.card-resizer {
  scale: v-bind(scale);
  transform-origin: top left;
  position: relative;
}
</style>
