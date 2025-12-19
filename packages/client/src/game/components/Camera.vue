<script setup lang="ts">
import UiSwitch from '@/ui/components/UiSwitch.vue';
import { useGameUi } from '../composables/useGameClient';
// import { useMouse, useWindowSize } from '@vueuse/core';

const ui = useGameUi();

const camera = ref({
  origin: { x: 0, y: 0 },
  scale: 1,
  angle: { x: 0, y: 0, z: 0 },
  offset: { x: 0, y: 0 }
});

const isTilted = computed({
  get() {
    return camera.value.angle.x !== 0 || camera.value.angle.y !== 0;
  },
  set(value: boolean) {
    if (value) {
      camera.value.angle.x = 15;
      camera.value.angle.y = 0;
      camera.value.offset.y = -5;
    } else {
      camera.value.angle.x = 0;
      camera.value.angle.y = 0;
      camera.value.offset.y = 0;
    }
  }
});
</script>

<template>
  <div class="options">
    <label>
      <UiSwitch v-model="isTilted" />
      <span class="option-title">Camera tilt</span>
    </label>
  </div>
  <div
    class="camera-zoom"
    :style="{
      transform: ` scale(${camera.scale})`,
      transformOrigin: `${camera.origin.x}px ${camera.origin.y}px`
    }"
  >
    <div
      class="camera-rotate"
      :style="{
        '--board-angle-X': `${camera.angle.x}deg`,
        '--board-angle-Y': `${camera.angle.y}deg`,
        '--board-angle-Z': `${camera.angle.z}deg`
      }"
    >
      <div class="camera-viewport" :id="ui.DOMSelectors.board.id">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped lang="postcss">
.camera-zoom {
  position: absolute;
  pointer-events: none;
  transform-style: preserve-3d;
}

.camera-rotate {
  width: 100vw;
  height: 100dvh;
  position: absolute;
  pointer-events: auto;
  transition: transform 1s var(--ease-4);
  transform: rotateY(var(--board-angle-Y)) rotateX(var(--board-angle-X))
    rotateZ(var(--board-angle-Z));
  transform-style: preserve-3d;
}

.options {
  pointer-events: auto;
  position: fixed;
  top: var(--size-5);
  right: var(--size-5);
  z-index: 10;
  label {
    display: flex;
    align-items: center;
    gap: var(--size-2);
    cursor: pointer;
    font-weight: 500;
  }
}

.camera-viewport {
  position: absolute;
  top: 0%;
  left: 50%;
  translate: -50% calc(v-bind('camera.offset.y') * 1%);
  transform-style: preserve-3d;
  width: 80vw;
  height: 100dvh;
  transition: translate 1s var(--ease-4);
}
</style>
