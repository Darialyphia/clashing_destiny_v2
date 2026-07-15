<script setup lang="ts">
import type { CardSpeed } from '@game/engine/src/card/card.enums';

const { speed } = defineProps<{
  speed: CardSpeed;
}>();
</script>

<template>
  <div class="speed parallax" :data-speed="speed.toLocaleLowerCase()">
    <div>
      {{ speed }}
    </div>
  </div>
</template>

<style scoped lang="postcss">
.speed {
  position: absolute;
  width: calc(55px * var(--pixel-scale));
  height: calc(16px * var(--pixel-scale));
  background-size: cover;
  right: calc(2px * var(--pixel-scale));
  bottom: calc(2px * var(--pixel-scale));
  font-family: 'Lato', sans-serif;
  font-size: calc(8px * var(--pixel-scale));
  letter-spacing: calc(1px * var(--pixel-scale));
  padding-left: calc(10px * var(--pixel-scale));
  padding-top: calc(2px * var(--pixel-scale));
  --dual-text-offset-y: calc(2px * var(--pixel-scale));
  --dual-text-offset-x: calc(6px * var(--pixel-scale));

  &[data-speed='slow'] {
    background-image: url('@/assets/ui/card/v2/speed-slow.png');
  }
  &[data-speed='fast'] {
    background-image: url('@/assets/ui/card/v2/speed-fast.png');
  }
}
</style>
