<script setup lang="ts">
import { lerp } from '@game/shared';
import { useRafFn } from '@vueuse/core';

const props = defineProps<{
  bg: string;
  x: number;
  y: number;
}>();

const MAX_ANGLE = 45;
const SCALE_FACTOR = 5;
const LERP_FACTOR = 0.3;

const rotation = ref({ x: 0, y: 0 });
let prev = { x: props.x, y: props.y };

useRafFn(() => {
  const delta = {
    x: props.x - prev.x,
    y: props.y - prev.y
  };
  prev = { x: props.x, y: props.y };

  rotation.value = {
    x: lerp(
      rotation.value.x,
      Math.round(
        Math.max(Math.min(delta.y * SCALE_FACTOR, MAX_ANGLE), -MAX_ANGLE) * -1
      ),
      LERP_FACTOR
    ),
    y: lerp(
      rotation.value.y,
      Math.round(
        Math.max(Math.min(delta.x * SCALE_FACTOR, MAX_ANGLE), -MAX_ANGLE)
      ),
      LERP_FACTOR
    )
  };
});
</script>

<template>
  <Teleport to="body">
    <div
      class="dragged-booster-pack"
      :style="{
        '--bg': bg,
        '--x': `${x}px`,
        '--y': `${y}px`
      }"
    />
  </Teleport>
</template>

<style scoped lang="postcss">
.dragged-booster-pack {
  pointer-events: none;
  position: fixed;
  z-index: 200;
  top: 0;
  left: 0;
  width: calc(95px * 2);
  height: calc(98px * 2);
  background: var(--bg);
  background-size: cover;
  filter: drop-shadow(0 20px 15px hsl(0 0% 0% / 0.5));
  transform-origin: center center;
  transform: translateX(calc(-50% + var(--x))) translateY(calc(-50% + var(--y)))
    perspective(800px) rotateX(calc(1deg * v-bind('rotation.x')))
    rotateY(calc(1deg * v-bind('rotation.y')));
}
</style>
