<script setup lang="ts">
import type { CardArt } from '@game/engine/src/card/card-blueprint';
import { type SpriteData } from '@/assets';
import { useSprite } from '@/shared/composables/useSprite';
import type { CardKind } from '@game/engine/src/card/card.enums';

const { art, kind, sprite, animationSequence } = defineProps<{
  art: CardArt;
  sprite: SpriteData;
  animationSequence?: string[];
  kind: CardKind;
}>();

// const artBgImage = computed(() => {
//   if (!art.bg) {
//     return null;
//   }
//   if (art.isFullArt || art.bg.includes('-alt')) {
//     return assets[art.bg].css;
//   }

//   return assets['cards/placeholder-spell-bg'].css;
// });

// const artMainImage = computed(() => {
//   return assets[art.main].css;
// });

const { activeFrameRect, bgPosition, imageBg } = useSprite({
  animationSequence: computed(() => animationSequence),
  sprite: computed(() => sprite),
  kind: computed(() => kind),
  scale: 1,
  scalePositionByPixelScale: true
});
</script>

<template>
  <div
    class="card-art"
    :class="[{ 'full-art': art.isFullArt }, kind.toLocaleLowerCase()]"
    :style="{
      '--bg-position': bgPosition,
      '--width': `${activeFrameRect.width}px`,
      '--height': `${activeFrameRect.height}px`,
      '--background-width': `calc(${sprite.sheetSize.w}px * var(--pixel-scale))`,
      '--background-height': `calc(${sprite.sheetSize.h}px * var(--pixel-scale))`
    }"
  >
    <!-- <div
      v-if="artBgImage"
      class="art-bg parallax"
      style="--parallax-strength: -1"
    /> -->
    <div
      class="sprite-shadow parallax"
      style="--parallax-strength-x: -3; --parallax-strength-y: -1"
    />
    <div
      class="sprite parallax"
      style="--parallax-strength-x: 1.5; --parallax-strength-y: 1"
    />
  </div>
</template>

<style scoped lang="postcss">
.card-art {
  position: absolute;
  width: calc(var(--pixel-scale) * var(--width));
  height: calc(var(--pixel-scale) * var(--height));
  left: 50%;
  transform: translateX(-50%);
  bottom: calc(100px * var(--pixel-scale));
  overflow: hidden;
  pointer-events: none;

  &.spell,
  &.rune,
  &.artifact {
    translate: 0 calc(var(--pixel-scale) * -15px);
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

.sprite {
  position: absolute;
  inset: 0;
  background: v-bind(imageBg);
  background-position: var(--bg-position);
  background-repeat: no-repeat;
  background-size: var(--background-width) var(--background-height);
  translate: calc(var(--parallax-x, 0)) var(--parallax-y, 0) !important;
  pointer-events: none;
}

.sprite-shadow {
  position: absolute;
  inset: 0;
  background: v-bind(imageBg);
  background-position: var(--bg-position);
  background-repeat: no-repeat;
  background-size: var(--background-width) var(--background-height);
  translate: calc(var(--parallax-x, 0)) var(--parallax-y, 0) !important;
  pointer-events: none;
  filter: contrast(0) brightness(0) blur(4px);
  transition: opacity 1s var(--ease-3);
  scale: 1.15;
  opacity: 0;
  /* position: absolute;
  inset: 0;
  pointer-events: none;
  background: v-bind(imageBg);
  background-position: var(--bg-position);
  background-repeat: no-repeat;
  background-size: var(--background-width) var(--background-height);
  translate: calc(var(--parallax-x, 0)) var(--parallax-y, 0) !important;
  pointer-events: none;
  translate: calc(-5 * var(--parallax-x))
    calc(-5 * var(--parallax-y) - var(--pixel-scale) * 20px);
 */
}

:global(.card-v3:has(.foil):hover .sprite-shadow) {
  opacity: 0.8;
}
</style>
