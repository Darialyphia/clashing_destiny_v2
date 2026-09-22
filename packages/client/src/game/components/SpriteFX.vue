<script setup lang="ts">
import { CARD_KINDS } from '@game/engine/src/card/card.enums';
import { isDefined } from '@game/shared';
import { sprites as spritesData } from '@/assets';
import { useSprite } from '@/shared/composables/useSprite';

const { sprites } = defineProps<{
  sprites: Array<{
    spriteId: string;
    animationSequence: string[];
    scale: number;
    offset: { x: number; y: number };
    tint?: string;
  }>;
}>();

const emit = defineEmits<{
  end: [];
}>();
const buildSprites = () => {
  const parts = sprites
    .map(s => {
      const sprite = useSprite({
        sprite: spritesData[s.spriteId],
        animationSequence: s.animationSequence,
        scale: s.scale,
        kind: CARD_KINDS.SPELL,
        repeat: true
      });
      if (!spritesData[s.spriteId]) {
        console.warn('Sprite data not found for spriteId:', s.spriteId);
        return null;
      }
      return {
        ...sprite,
        spriteData: spritesData[s.spriteId],
        id: s.spriteId,
        scale: s.scale,
        offset: s.offset,
        tint: s.tint ?? 'transparent'
      };
    })
    .filter(isDefined);

  return parts;
};
const _sprites = buildSprites();
if (_sprites.length === 0) {
  console.warn('No valid sprites to play in SpriteFX component');
  emit('end');
}

const isDone = computed(() => _sprites.every(sprite => sprite.isDone.value));

watch(isDone, done => {
  if (done) {
    emit('end');
  }
});
</script>

<template>
  <div ref="spriteContainer" class="sprite-fx-container">
    <template v-for="sprite in _sprites" :key="sprite.id">
      <div
        v-if="!sprite.isDone.value && sprite.spriteData"
        class="sprite-fx"
        :style="{
          '--bg-position': sprite.bgPosition.value,
          '--width': `${sprite.activeFrameRect.value.width}px`,
          '--height': `${sprite.activeFrameRect.value.height}px`,
          '--background-width': `calc(${sprite.scale} * ${sprite.spriteData.sheetSize.w}px)`,
          '--background-height': `calc(${sprite.scale} * ${sprite.spriteData.sheetSize.h}px)`,
          '--offset-x': `${sprite.offset.x}px`,
          '--offset-y': `${sprite.offset.y}px`,
          '--scale': sprite.scale,
          '--image-bg': sprite.imageBg.value,
          '--tint-color': sprite.tint
        }"
      />
    </template>
  </div>
</template>

<style scoped lang="postcss">
.sprite-fx-container {
  position: absolute;
}

.sprite-fx {
  --pixel-scale: var(--scale);
  position: absolute;
  /* scale: var(--scale) var(--scale); */
  top: 50%;
  left: 50%;
  translate: calc(-50% + var(--offset-x)) calc(-50% + var(--offset-y));
  width: var(--width);
  height: var(--height);
  background: var(--image-bg);
  background-position: var(--bg-position);
  background-repeat: no-repeat;
  background-size: var(--background-width) var(--background-height);
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background-color: var(--tint-color);
    mask-image: var(--image-bg);
    mask-position: var(--bg-position);
    mask-size: var(--background-width) var(--background-height);
    mix-blend-mode: color;
  }
}
</style>
