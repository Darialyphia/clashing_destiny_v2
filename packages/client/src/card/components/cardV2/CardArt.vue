<script setup lang="ts">
import type { CardArt } from '@game/engine/src/card/card-blueprint';
import { assets } from '@/assets';

const { art } = defineProps<{
  art: CardArt;
}>();

const artBgImage = computed(() => {
  return assets[art.bg].css;
});

const artMainImage = computed(() => {
  return assets[art.main].css;
});
</script>

<template>
  <div class="card-art" :class="{ 'full-art': art.isFullArt }">
    <div class="art-bg parallax" style="--parallax-strength: -1" />
    <div
      class="art-main-shadow parallax"
      style="--parallax-strength-x: -5; --parallax-strength-y: -5"
    />
    <div
      class="art-main parallax"
      style="--parallax-strength-x: 1.5; --parallax-strength-y: 1"
    />
  </div>
</template>

<style scoped lang="postcss">
.card-art {
  position: absolute;
  width: calc(var(--card-v2-art-frame-width) * var(--pixel-scale) * 2);
  height: calc(var(--card-v2-art-frame-height) * var(--pixel-scale) * 2);
  left: calc(2px * var(--pixel-scale));
  top: calc(2px * var(--pixel-scale));

  &:not(.full-art) {
    mask-image: url('@/assets/ui/card/masks/card-art-v2.png');
    mask-size: cover;
  }
  &.full-art {
    width: calc(var(--card-v2-width) * var(--pixel-scale));
    height: calc(var(--card-v2-height) * var(--pixel-scale));
    left: 0;
    top: 0;

    &::after {
      content: '';
      position: absolute;
      inset: 0;
      background-image: url('@/assets/ui/card/v2/full-art-overlay.png');
      background-size: cover;
      pointer-events: none;
    }
  }
}

@keyframes full-art-glow {
  from {
    opacity: 0.25;
  }
  to {
    opacity: 1;
  }
}

.art-main {
  background-image: v-bind(artMainImage);
  background-size: cover;
  background-position: center;
  position: absolute;
  inset: 0;
  .full-art & {
    &::after {
      content: '';
      background-image: v-bind(artMainImage);
      background-size: cover;
      background-position: center;
      position: absolute;
      inset: 0;
      mix-blend-mode: plus-lighter;
      filter: blur(calc(var(--pixel-scale) * 7px));
      animation: full-art-glow 2s var(--ease-3) infinite alternate;
    }
  }
}

.art-bg {
  background-image: v-bind(artBgImage);
  background-size: cover;
  background-position: center;
  width: 100%;
  position: absolute;
  inset: 0;
}

.art-main-shadow {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image: v-bind(artMainImage);
  background-position: var(--bg-position);
  background-repeat: no-repeat;
  background-size: cover;
  translate: calc(-5 * var(--parallax-x))
    calc(-5 * var(--parallax-y) - var(--pixel-scale) * 20px);
  filter: contrast(0) brightness(0) blur(4px);
  transition: opacity 1s var(--ease-3);
  scale: 1.15;
  opacity: 0;
}

:global(.card-v2:has(.foil):hover .art-main-shadow) {
  opacity: 0.6;
}
</style>
