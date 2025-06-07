<script setup lang="ts">
import { useResizeObserver } from '@vueuse/core';

const { enabled = true } = defineProps<{
  enabled?: boolean;
}>();

const root = useTemplateRef('root');

const scale = ref(1);
const calculateScale = () => {
  if (!root.value) return;
  if (!enabled) {
    scale.value = 1;
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
onMounted(calculateScale);
</script>

<template>
  <div class="card-resizer" ref="root">
    <slot />
  </div>
</template>

<style scoped lang="postcss">
.card-resizer {
  transform: scale(v-bind(scale));
  transform-origin: top left;
  position: relative;
}
</style>
