<script setup lang="ts">
import { useSprite } from '@/shared/composables/useSprite';
import { sprites } from '@/assets';
import { CARD_KINDS } from '@game/engine/src/card/card.enums';

const sprite = computed(() => sprites['fx/card-foil-spark']);
const { bgPosition, imageBg } = useSprite({
  animationSequence: computed(() => ['default']),
  sprite,
  kind: computed(() => CARD_KINDS.ARTIFACT),
  scale: 1,
  scalePositionByPixelScale: true
});
</script>

<template>
  <div
    class="foil foil-bluespark"
    :style="{
      '--bg-position': bgPosition,

      '--background-width': `calc(${sprite.sheetSize.w}px * var(--pixel-scale))`,
      '--background-height': `calc(${sprite.sheetSize.h}px * var(--pixel-scale))`
    }"
  ></div>
</template>

<style scoped lang="postcss">
@keyframes blur-hue-rotate {
  0% {
    filter: hue-rotate(0deg);
  }
  50% {
    filter: hue-rotate(180deg);
  }
  100% {
    filter: hue-rotate(360deg);
  }
}
.foil-bluespark {
  position: absolute;
  inset: 0;
  animation: blur-hue-rotate 1.2s infinite;
  background: v-bind(imageBg);
  background-position: var(--bg-position);
  background-repeat: no-repeat;
  background-size: var(--background-width) var(--background-height);
  translate: calc(var(--parallax-x, 0)) var(--parallax-y, 0) !important;
  pointer-events: none;
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: v-bind(imageBg);
    background-position: var(--bg-position);
    background-repeat: no-repeat;
    background-size: var(--background-width) var(--background-height);
    pointer-events: none;
    mix-blend-mode: plus-lighter;
    filter: blur(10px);
  }
}
</style>
