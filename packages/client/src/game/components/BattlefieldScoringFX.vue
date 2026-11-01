<script setup lang="ts">
import gsap from 'gsap';

const MAX_MOTES = 6;
const CHARGE_DURATION = 0.25;
const MOTE_STAGGER = 0.07;
const MOTE_TRAVEL_DURATION = 0.45;
const ALLY_COLOR = '240, 220, 86';
const ENEMY_COLOR = '255, 107, 107';

const side = ref<'ally' | 'enemy'>('ally');
const color = computed(() =>
  side.value === 'ally' ? ALLY_COLOR : ENEMY_COLOR
);
const gainText = ref('');

const ringEl = useTemplateRef('ring');
const waveEl = useTemplateRef('wave');
const shineBandEl = useTemplateRef('shineBand');
const gainEl = useTemplateRef('gain');
const moteEls = useTemplateRef<HTMLElement[]>('motes');

const getCenter = (el: HTMLElement) => {
  const rect = el.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
};

/**
 * Transfers the scoring minion's influence to the battlefield's influence counter:
 * one mote per influence point flies from the minion to the counter, ticking it up as it lands.
 * Resolves when the last mote has landed, the rest of the fx keeps playing in the background.
 */
const play = ({
  minion,
  badge,
  location,
  scorerCounter,
  otherCounter,
  amount,
  isAlly,
  isTakingTheLead,
  onTick
}: {
  minion: HTMLElement;
  badge: HTMLElement;
  location: HTMLElement;
  scorerCounter: HTMLElement;
  otherCounter: HTMLElement;
  amount: number;
  isAlly: boolean;
  isTakingTheLead: boolean;
  onTick: (amount: number) => void;
}) => {
  return new Promise<void>(resolve => {
    side.value = isAlly ? 'ally' : 'enemy';
    gainText.value = `+${amount}`;

    const rgb = color.value;
    const neutralFilter = `brightness(1) drop-shadow(0 0 0px rgba(${rgb}, 0))`;
    const glowFilter = (brightness: number, blur: number) =>
      `brightness(${brightness}) drop-shadow(0 0 ${blur}px rgba(${rgb}, 1))`;

    const moteCount = gsap.utils.clamp(0, MAX_MOTES, amount);
    const motes = moteEls.value?.slice(0, moteCount) ?? [];
    const from = getCenter(badge);
    const to = getCenter(scorerCounter);

    // the cards have a css transition on all properties, which would fight with gsap
    minion.style.transition = 'none';
    location.style.transition = 'none';

    const fxEls = [
      ringEl.value,
      waveEl.value,
      shineBandEl.value,
      gainEl.value,
      ...motes
    ].filter(Boolean);
    const tl = gsap.timeline({
      onComplete() {
        location.style.transition = '';
        gsap.set([location, scorerCounter, otherCounter], {
          clearProps: 'transform,filter'
        });
        gsap.set(fxEls, { clearProps: 'all' });
      }
    });

    // charge: the minion lifts while its influence swells
    tl.fromTo(
      minion,
      { filter: neutralFilter },
      {
        y: -10,
        scale: 1.08,
        filter: glowFilter(1.4, 10),
        duration: CHARGE_DURATION,
        ease: 'power2.out'
      },
      0
    );
    tl.to(
      badge,
      { scale: 1.5, duration: CHARGE_DURATION, ease: 'back.out(3)' },
      0
    );

    const departAt = CHARGE_DURATION - 0.05;
    const lastDepartAt = departAt + Math.max(moteCount - 1, 0) * MOTE_STAGGER;
    const firstLandAt = departAt + MOTE_TRAVEL_DURATION;
    const lastLandAt = lastDepartAt + MOTE_TRAVEL_DURATION;

    // transfer: the motes arc from the minion's influence to the counter,
    // bending away from the minion so they don't cross over its art
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const length = Math.hypot(dx, dy) || 1;
    const minionCenter = getCenter(minion);
    const outwardSide =
      Math.sign(
        (-dy / length) * (from.x - minionCenter.x) +
          (dx / length) * (from.y - minionCenter.y)
      ) || 1;
    motes.forEach((mote, index) => {
      const departureTime = departAt + index * MOTE_STAGGER;
      const landingTime = departureTime + MOTE_TRAVEL_DURATION;
      const bend = outwardSide * gsap.utils.random(25, 70);
      const control = {
        x: (from.x + to.x) / 2 - (dy / length) * bend,
        y: (from.y + to.y) / 2 + (dx / length) * bend
      };
      // spreads the amount over the motes when there are more points than motes
      const increment =
        Math.floor((amount * (index + 1)) / moteCount) -
        Math.floor((amount * index) / moteCount);

      // the motion path starts from the mote's current position, so it has to sit on the minion beforehand
      gsap.set(mote, { x: from.x, y: from.y });
      tl.fromTo(
        mote,
        { scale: 0, autoAlpha: 1 },
        { scale: 1, duration: 0.12, immediateRender: false },
        departureTime
      );
      tl.to(
        mote,
        {
          motionPath: {
            path: [control, to],
            curviness: 1.25,
            autoRotate: true
          },
          duration: MOTE_TRAVEL_DURATION,
          ease: 'power2.in'
        },
        departureTime
      );
      tl.to(mote, { scale: 0, autoAlpha: 0, duration: 0.08 }, landingTime);
      tl.call(() => onTick(increment), undefined, landingTime);

      const isLastMote = index === moteCount - 1;
      if (!isLastMote || !isTakingTheLead) {
        tl.fromTo(
          scorerCounter,
          { scale: 1.35 },
          {
            scale: 1,
            duration: 0.25,
            ease: 'power2.out',
            immediateRender: false
          },
          landingTime
        );
      }
    });

    // once it has given all its influence, the minion settles back
    const settleAt = lastDepartAt + 0.05;
    const settleDuration = 0.25;
    tl.to(badge, { scale: 1, duration: 0.2, ease: 'power2.out' }, settleAt);
    tl.to(
      minion,
      {
        y: 0,
        scale: 1,
        filter: neutralFilter,
        duration: settleDuration,
        ease: 'power2.inOut'
      },
      settleAt
    );
    tl.call(
      () => {
        minion.style.transition = '';
        gsap.set(minion, { clearProps: 'transform,filter' });
        gsap.set(badge, { clearProps: 'transform' });
      },
      undefined,
      settleAt + settleDuration
    );

    if (!moteCount) {
      tl.call(resolve, undefined, settleAt + settleDuration);
      return;
    }
    tl.call(resolve, undefined, lastLandAt);

    // absorb: the location recoils away from the scoring side when the first mote hits
    tl.fromTo(
      location,
      { y: 0, filter: neutralFilter },
      {
        y: isAlly ? -6 : 6,
        filter: glowFilter(1.6, 12),
        duration: 0.08,
        ease: 'power2.out',
        immediateRender: false
      },
      firstLandAt
    );
    tl.to(
      location,
      { y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' },
      firstLandAt + 0.08
    );
    tl.fromTo(
      ringEl.value,
      { scale: 1, autoAlpha: 1 },
      {
        scale: 1.5,
        autoAlpha: 0,
        duration: 0.5,
        ease: 'power2.out',
        immediateRender: false
      },
      firstLandAt
    );

    // payoff: the total gained floats up from the counter
    tl.fromTo(
      gainEl.value,
      { y: 10, scale: 0.5, autoAlpha: 0 },
      {
        y: -6,
        scale: 1,
        autoAlpha: 1,
        duration: 0.25,
        ease: 'back.out(2)',
        immediateRender: false
      },
      lastLandAt
    );
    tl.to(
      gainEl.value,
      { y: -30, autoAlpha: 0, duration: 0.5, ease: 'power1.in' },
      lastLandAt + 0.7
    );

    if (!isTakingTheLead) {
      tl.to(
        location,
        { filter: neutralFilter, duration: 0.5, ease: 'power2.out' },
        lastLandAt
      );
      return;
    }

    // taking the lead: the location lights up in the scoring player's color and the other counter is knocked back
    tl.addLabel('lead', lastLandAt);
    tl.to(
      location,
      { filter: glowFilter(1.5, 24), duration: 0.15, ease: 'power2.out' },
      'lead'
    );
    tl.to(
      location,
      { filter: neutralFilter, duration: 0.8, ease: 'power2.inOut' },
      'lead+=0.5'
    );
    tl.fromTo(
      shineBandEl.value,
      { xPercent: -100, skewX: -20, autoAlpha: 1 },
      {
        xPercent: 250,
        duration: 0.6,
        ease: 'power2.inOut',
        immediateRender: false
      },
      'lead'
    );
    tl.fromTo(
      waveEl.value,
      { scale: 1, autoAlpha: 1 },
      {
        scale: 2.2,
        autoAlpha: 0,
        duration: 0.9,
        ease: 'power2.out',
        immediateRender: false
      },
      'lead'
    );
    tl.fromTo(
      scorerCounter,
      { scale: 1.8 },
      {
        scale: 1,
        duration: 0.7,
        ease: 'elastic.out(1.2, 0.4)',
        immediateRender: false
      },
      'lead'
    );
    tl.to(
      otherCounter,
      { keyframes: { x: [0, -6, 5, -4, 2, 0] }, duration: 0.45, ease: 'none' },
      'lead'
    );
    tl.fromTo(
      otherCounter,
      { filter: 'brightness(0.5)' },
      { filter: 'brightness(1)', duration: 0.6, immediateRender: false },
      'lead'
    );
  });
};

defineExpose({ play });
</script>

<template>
  <div
    class="scoring-fx"
    :class="`is-${side}`"
    :style="{ '--fx-color': `rgb(${color})` }"
  >
    <div ref="ring" class="ring" />
    <div ref="wave" class="wave" />
    <div class="shine">
      <div ref="shineBand" class="shine-band" />
    </div>
    <div ref="gain" class="gain">{{ gainText }}</div>
  </div>

  <Teleport to="body">
    <div class="motes" :style="{ '--fx-color': `rgb(${color})` }">
      <div v-for="i in MAX_MOTES" :key="i" ref="motes" class="mote" />
    </div>
  </Teleport>
</template>

<style scoped lang="postcss">
.scoring-fx {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.ring,
.wave,
.shine-band,
.gain,
.mote {
  opacity: 0;
  visibility: hidden;
}

.ring {
  position: absolute;
  inset: 0;
  border: solid 3px var(--fx-color);
  border-radius: var(--radius-2);
  box-shadow:
    0 0 12px var(--fx-color),
    inset 0 0 12px var(--fx-color);
}

.wave {
  position: absolute;
  inset: 0;
  border: solid 2px white;
  border-radius: var(--radius-3);
  box-shadow: 0 0 16px 4px var(--fx-color);
}

.shine {
  position: absolute;
  inset: 0;
  overflow: hidden;
  border-radius: var(--radius-2);
  mix-blend-mode: screen;
}

.shine-band {
  position: absolute;
  top: -25%;
  bottom: -25%;
  left: 0;
  width: 45%;
  background: linear-gradient(
    90deg,
    transparent,
    var(--fx-color) 35%,
    white 50%,
    var(--fx-color) 65%,
    transparent
  );
}

.gain {
  position: absolute;
  left: calc(50% + 24px);
  margin-top: -16px;
  font-size: 24px;
  font-weight: var(--font-weight-9);
  color: white;
  -webkit-text-stroke: 4px black;
  paint-order: stroke fill;
  text-shadow: 0 0 8px var(--fx-color);

  .is-ally & {
    top: 100%;
  }
  .is-enemy & {
    top: 0;
  }
}

.motes {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 10;
}

.mote {
  position: absolute;
  top: 0;
  left: 0;
  width: 18px;
  height: 8px;
  margin: -4px 0 0 -9px;
  border-radius: 50%;
  background: radial-gradient(
    ellipse at 70% 50%,
    white 20%,
    var(--fx-color) 60%,
    transparent
  );
  box-shadow: 0 0 8px 2px var(--fx-color);

  /* comet tail, autoRotate keeps it behind the mote */
  &::after {
    content: '';
    position: absolute;
    right: 50%;
    top: 50%;
    width: 24px;
    height: 4px;
    margin-top: -2px;
    border-radius: 2px;
    background: linear-gradient(to left, var(--fx-color), transparent);
  }
}
</style>
