<script setup lang="ts">
import { useTemplateRef } from 'vue';
import { useAutoResizeText } from '@/card/composables/useAutoResizeText';

defineProps<{
  name: string;
}>();

const nameBox = useTemplateRef('name-box');
const { fontSize: nameFontSize } = useAutoResizeText(nameBox, {
  min: 14,
  max: 24,
  ideal: 24
});
</script>

<template>
  <div ref="name-box" class="name parallax">
    <div
      class="dual-text"
      :data-text="name"
      style="
        --dual-text-stroke-offset-y: calc(-1px * var(--pixel-scale));
        --dual-text-stroke: calc(0.5px * var(--pixel-scale));
      "
    >
      {{ name }}
    </div>
  </div>
</template>

<style scoped lang="postcss">
.name {
  position: absolute;
  top: calc(94px * var(--pixel-scale));
  left: 0;
  width: 100%;
  text-align: center;
  font-weight: bold;
  color: transparent;
  font-size: v-bind(nameFontSize);
}
</style>
