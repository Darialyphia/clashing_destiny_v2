<script setup lang="ts">
import { sprites } from '@/assets';
import { useSprite } from '@/shared/composables/useSprite';
import type { CardBlueprint } from '@game/engine/src/card/card-blueprint';
import { CARD_KINDS } from '@game/engine/src/card/card.enums';
import { ANIMATIONS_NAMES } from '@game/engine/src/game/game.enums';

const {
  blueprint,
  size = 128,
  isSilhouette = false
} = defineProps<{
  blueprint: CardBlueprint;
  // size of the square tile, in px
  size?: number;
  // renders the sprite all black, turning it off fades the colors back in
  isSilhouette?: boolean;
}>();

const sprite = computed(
  () => sprites[`cards/${blueprint.art.default.sprite}`] ?? null
);

const isMinion = computed(() => blueprint.kind === CARD_KINDS.MINION);

// minion frames have a lot of empty space around the character, so we zoom in
// and let the tile crop the edges, other kinds' art fills their frame.
// Integer scale keeps the pixel art crisp.
const spriteScale = computed(() => {
  const frameWidth = sprite.value?.frameSize.w ?? size;
  if (!isMinion.value) {
    return Math.min(3, Math.max(1, Math.floor(size / frameWidth)));
  }
  return Math.min(3, Math.max(1, Math.round((size * 1.5) / frameWidth)));
});

const { bgPosition, activeFrameRect, imageBg } = useSprite({
  sprite,
  kind: () => blueprint.kind,
  animationSequence: () =>
    blueprint.kind === CARD_KINDS.MINION
      ? [ANIMATIONS_NAMES.BREATHING]
      : [ANIMATIONS_NAMES.DEFAULT],
  scalePositionByPixelScale: true
});
</script>

<template>
  <div
    class="card-sprite-thumb"
    :class="{ 'is-minion': isMinion, 'is-silhouette': isSilhouette }"
    :style="{
      '--pixel-scale': spriteScale,
      '--tile-size': `${size}px`,
      '--bg-position': bgPosition,
      '--width': `${activeFrameRect.width}px`,
      '--height': `${activeFrameRect.height}px`,
      '--background-width': `calc(${sprite?.sheetSize.w ?? 0}px * var(--pixel-scale))`,
      '--background-height': `calc(${sprite?.sheetSize.h ?? 0}px * var(--pixel-scale))`
    }"
  >
    <div class="sprite" />
  </div>
</template>

<style scoped lang="postcss">
.card-sprite-thumb {
  position: relative;
  width: var(--tile-size);
  height: var(--tile-size);
  overflow: hidden;
}

/* absolute positioning keeps the sprite centered when it overflows the tile */
.sprite {
  position: absolute;
  left: 50%;
  top: 50%;
  translate: -50% -50%;
  /* minions stand at the bottom of their frame, like on the card */
  .is-minion & {
    top: auto;
    bottom: 0;
    translate: -50% 0;
  }
  width: calc(var(--pixel-scale) * var(--width));
  height: calc(var(--pixel-scale) * var(--height));
  background: v-bind(imageBg);
  background-position: var(--bg-position);
  background-repeat: no-repeat;
  background-size: var(--background-width) var(--background-height);
  image-rendering: pixelated;
  pointer-events: none;
  transition: filter 0.6s var(--ease-out-3);

  .is-silhouette & {
    filter: brightness(0);
  }
}
</style>
