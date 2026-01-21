<script setup lang="ts">
import { Icon } from '@iconify/vue';

const { size = 5 } = defineProps<{
  size?: string | number;
}>();
</script>

<template>
  <Icon
    icon="svg-spinners:90-ring-with-bg"
    class="ui-spinner"
    :style="{ '--size': `var(--size-${size})` }"
  />
</template>

<style scoped lang="postcss">
.ui-spinner {
  width: var(--size);
  aspect-ratio: 1;
}
</style>
