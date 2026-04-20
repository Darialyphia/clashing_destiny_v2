<script setup lang="ts">
import { useIsKeyboardControlPressed } from '@/shared/composables/useKeyboardControl';
import { RichText } from '@/shared/components/RichText/RichText';

const { text } = defineProps<{
  text: string;
}>();

const showFullText = useIsKeyboardControlPressed({
  key: 'ShiftLeft',
  modifier: null
});
</script>

<template>
  <div class="card-text" :class="{ 'show-full-text': showFullText }">
    <RichText :html="text" />
  </div>
</template>

<style scoped lang="postcss">
.card-text {
  white-space: pre-wrap;
  color: var(--card-text-color, var(--card-text-color, black));
  line-height: 1.4;
}
</style>
