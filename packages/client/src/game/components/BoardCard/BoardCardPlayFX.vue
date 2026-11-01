<script setup lang="ts">
import { useSoundEffect } from '@/shared/composables/useSoundEffect';
import gsap from 'gsap';

const SPARK_COUNT = 14;
const GLOW_COLOR = '255, 212, 59';
const DROP_DURATION = 0.35;

const beamEl = useTemplateRef('beam');
const ringEl = useTemplateRef('ring');
const waveEl = useTemplateRef('wave');
const sparkEls = useTemplateRef<HTMLElement[]>('sparks');

const playSound = useSoundEffect('play-card');
const playSound2 = useSoundEffect('play-card-2');

const play = (
  card: HTMLElement,
  { onComplete }: { onComplete?: () => void } = {}
) => {
  return new Promise<void>(resolve => {
    // the card has a css transition on all properties, which would fight with gsap
    card.style.transition = 'none';
    gsap.set(card, { zIndex: 1 });

    const tl = gsap.timeline({
      onComplete() {
        card.style.transition = '';
        gsap.set(card, {
          clearProps: 'transform,filter,opacity,visibility,zIndex'
        });
        onComplete?.();
      }
    });

    // the card falls down a beam of light while a ring closes in on its space
    playSound.value?.play();
    setTimeout(() => {
      playSound2.value?.play();
    }, 500);
    tl.fromTo(
      card,
      {
        y: -180,
        scale: 2,
        rotation: gsap.utils.random(-12, 12),
        filter: `brightness(3) drop-shadow(0 0 0px rgba(${GLOW_COLOR}, 0))`
      },
      {
        y: 0,
        scale: 1,
        rotation: 0,
        filter: `brightness(2) drop-shadow(0 0 16px rgba(${GLOW_COLOR}, 1))`,
        duration: DROP_DURATION,
        ease: 'power3.in'
      },
      0
    );
    tl.fromTo(
      card,
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: 0.15, ease: 'power1.out' },
      0
    );
    tl.fromTo(
      beamEl.value,
      { scaleX: 0.3, autoAlpha: 0 },
      { scaleX: 1, autoAlpha: 1, duration: DROP_DURATION, ease: 'power2.in' },
      0
    );
    tl.fromTo(
      ringEl.value,
      { scale: 1.8, autoAlpha: 0 },
      { scale: 1, autoAlpha: 1, duration: DROP_DURATION, ease: 'power2.in' },
      0
    );
    tl.addLabel('impact', DROP_DURATION);
    tl.call(resolve, undefined, 'impact+=0.15');

    // squash on impact, then wobble back into shape
    tl.to(
      card,
      { scaleX: 1.15, scaleY: 0.85, duration: 0.07, ease: 'power1.out' },
      'impact'
    );
    tl.to(card, {
      scaleX: 1,
      scaleY: 1,
      duration: 0.6,
      ease: 'elastic.out(1.2, 0.35)'
    });
    tl.to(
      card,
      {
        filter: `brightness(1) drop-shadow(0 0 0px rgba(${GLOW_COLOR}, 0))`,
        duration: 0.7,
        ease: 'power2.out'
      },
      'impact+=0.1'
    );

    // the beam collapses and the ring bursts outwards, followed by a wider shockwave
    tl.to(
      beamEl.value,
      { scaleX: 0, autoAlpha: 0, duration: 0.4, ease: 'power2.in' },
      'impact'
    );
    tl.to(
      ringEl.value,
      { scale: 2.2, autoAlpha: 0, duration: 0.5, ease: 'power2.out' },
      'impact'
    );
    tl.fromTo(
      waveEl.value,
      { scale: 1, autoAlpha: 0.8 },
      {
        scale: 3,
        autoAlpha: 0,
        duration: 0.8,
        ease: 'power2.out',
        immediateRender: false
      },
      'impact+=0.05'
    );

    // sparks burst outwards from the card's edges
    const halfWidth = card.offsetWidth / 2;
    const halfHeight = card.offsetHeight / 2;
    sparkEls.value?.forEach(spark => {
      const angle = gsap.utils.random(0, Math.PI * 2);
      const distance = gsap.utils.random(40, 90);
      const startX = Math.cos(angle) * halfWidth;
      const startY = Math.sin(angle) * halfHeight;
      tl.fromTo(
        spark,
        {
          x: startX,
          y: startY,
          rotation: (angle * 180) / Math.PI,
          scaleX: gsap.utils.random(1, 2),
          scaleY: 1,
          autoAlpha: 1
        },
        {
          x: startX + Math.cos(angle) * distance,
          y: startY + Math.sin(angle) * distance,
          scaleX: 0,
          scaleY: 0.5,
          autoAlpha: 0,
          duration: gsap.utils.random(0.4, 0.8),
          ease: 'power3.out',
          immediateRender: false
        },
        'impact'
      );
    });
  });
};

defineExpose({ play });
</script>

<template>
  <div class="play-fx">
    <div ref="beam" class="beam" />
    <div ref="ring" class="ring" />
    <div ref="wave" class="wave" />
    <span v-for="i in SPARK_COUNT" :key="i" ref="sparks" class="spark" />
  </div>
</template>

<style scoped lang="postcss">
.play-fx {
  position: absolute;
  inset: 0;
  pointer-events: none;

  > * {
    position: absolute;
    opacity: 0;
    visibility: hidden;
  }
}

.beam {
  z-index: -1;
  left: 10%;
  right: 10%;
  bottom: 50%;
  height: 320px;
  transform-origin: bottom center;
  background: linear-gradient(
    to right,
    transparent,
    rgba(255, 240, 180, 0.9),
    transparent
  );
  mask-image: linear-gradient(to top, black, transparent);
}

.ring {
  z-index: -1;
  inset: 0;
  border: solid 3px var(--yellow-3);
  border-radius: var(--radius-2);
  box-shadow:
    0 0 12px var(--yellow-4),
    inset 0 0 12px var(--yellow-4);
}

.wave {
  z-index: -1;
  inset: 0;
  border: solid 2px var(--yellow-1);
  border-radius: var(--radius-3);
  box-shadow: 0 0 8px var(--yellow-3);
}

.spark {
  top: 50%;
  left: 50%;
  width: 14px;
  height: 4px;
  margin: -2px 0 0 -7px;
  background: white;
  box-shadow:
    0 0 4px 1px var(--yellow-3),
    0 0 8px 2px var(--orange-5);
}
</style>
