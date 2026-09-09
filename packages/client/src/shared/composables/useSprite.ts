import { computed, ref, watch, type MaybeRefOrGetter } from 'vue';
import { useIntervalFn } from '@vueuse/core';
import { isDefined, type EmptyObject } from '@game/shared';
import { CARD_KINDS, type CardKind } from '@game/engine/src/card/card.enums';
import { TypedEventEmitter } from '@game/engine/src/utils/typed-emitter';
import { ANIMATIONS_NAMES } from '@game/engine/src/game/game.enums';
import { assets } from '@/assets';

export interface SpriteData {
  id: string;
  frameSize: { w: number; h: number };
  sheetSize: { w: number; h: number };
  animations: Record<
    string,
    { startFrame: number; endFrame: number; frameDuration: number }
  >;
}

const FALLBACK_ANIMATION_BY_KIND: Record<CardKind, string> = {
  [CARD_KINDS.MINION]: ANIMATIONS_NAMES.BREATHING,
  [CARD_KINDS.SPELL]: ANIMATIONS_NAMES.DEFAULT,
  [CARD_KINDS.ARTIFACT]: ANIMATIONS_NAMES.DEFAULT,
  [CARD_KINDS.RUNE]: ANIMATIONS_NAMES.DEFAULT,
  [CARD_KINDS.DESTINY]: ANIMATIONS_NAMES.DEFAULT
};
export function useSprite({
  sprite,
  animationSequence,
  kind,
  scale = 1,
  repeat = true,
  scalePositionByPixelScale = false
}: {
  sprite: MaybeRefOrGetter<SpriteData | null>;
  animationSequence: MaybeRefOrGetter<string[] | undefined>;
  kind: MaybeRefOrGetter<CardKind>;
  scale?: number;
  repeat?: boolean;
  scalePositionByPixelScale?: boolean;
}) {
  const emitter = new TypedEventEmitter<{
    sequenceEnd: EmptyObject;
    frame: { index: number; total: number };
  }>();
  const spriteRef = computed(() => toValue(sprite));
  const sequenceRef = computed(() => toValue(animationSequence));
  const kindRef = computed(() => toValue(kind));
  const shouldAnimate = computed(
    () => isDefined(sequenceRef.value) && sequenceRef.value.length > 0
  );
  const isDone = ref(false);

  const sequenceToUse = computed(() => {
    if (sequenceRef.value && sequenceRef.value.length > 0) {
      return sequenceRef.value;
    }
    return [FALLBACK_ANIMATION_BY_KIND[kindRef.value]];
  });

  const currentSequenceIndex = ref(0);
  watch(sequenceToUse, () => {
    currentSequenceIndex.value = 0;
    isDone.value = false;
  });

  const currentAnimation = computed(() => {
    if (!spriteRef.value) return null;
    const name = sequenceToUse.value[currentSequenceIndex.value];
    return spriteRef.value.animations[name];
  });

  const currentFrame = ref(0);

  watch(
    currentAnimation,
    anim => {
      if (anim) {
        currentFrame.value = anim.startFrame;
      } else {
        currentFrame.value = 0;
      }
    },
    { immediate: true }
  );
  useIntervalFn(
    () => {
      if (!spriteRef.value) return;
      if (!currentAnimation.value || !shouldAnimate.value) return;
      const { startFrame, endFrame } = currentAnimation.value;
      const totalFrames = endFrame - startFrame + 1;
      if (currentFrame.value >= endFrame) {
        if (currentSequenceIndex.value < sequenceToUse.value.length - 1) {
          currentSequenceIndex.value++;
          // Manually update frame to avoid glitch before watcher runs
          const nextAnimName = sequenceToUse.value[currentSequenceIndex.value];
          const nextAnim = spriteRef.value.animations[nextAnimName];
          if (nextAnim) {
            currentFrame.value = nextAnim.startFrame;
          }
        } else {
          currentFrame.value = startFrame;
          if (!repeat) {
            isDone.value = true;
            return;
          }

          emitter.emit('sequenceEnd', {});
        }
      } else {
        currentFrame.value++;
      }
      emitter.emit('frame', {
        index: currentFrame.value - startFrame,
        total: totalFrames
      });
    },
    () => currentAnimation.value?.frameDuration ?? 100
  );

  const activeFrameRect = computed(() => {
    if (!spriteRef.value) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }
    return {
      x: currentFrame.value * spriteRef.value.frameSize.w,
      y: 0,
      width: spriteRef.value.frameSize.w * scale,
      height: spriteRef.value.frameSize.h * scale
    };
  });

  const bgPosition = computed(() => {
    const { y } = activeFrameRect.value;
    return `calc(-${scale} * ${currentFrame.value} * ${spriteRef.value?.frameSize.w ?? 0} ${scalePositionByPixelScale ? '* var(--pixel-scale)' : ''} * 1px) calc(-${scale} ${scalePositionByPixelScale ? '* var(--pixel-scale)' : ''} * ${y}px)`;
  });

  const imageBg = computed(() => {
    return assets[`${spriteRef.value?.id}`]?.css ?? 'none';
  });

  return {
    currentFrame,
    currentAnimation,
    activeFrameRect,
    bgPosition,
    imageBg,
    shouldAnimate,
    isDone,
    on: emitter.on.bind(emitter),
    off: emitter.off.bind(emitter),
    once: emitter.once.bind(emitter)
  };
}
