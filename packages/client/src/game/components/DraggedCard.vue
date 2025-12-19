<script setup lang="ts">
import { isDefined, lerp } from '@game/shared';
import { useEventListener, useRafFn } from '@vueuse/core';
import {
  useGameUi,
  useGameState,
  useGameClient,
  useFxEvent
} from '../composables/useGameClient';
import { INTERACTION_STATES } from '@game/engine/src/game/systems/game-interaction.system';
import { Flip } from 'gsap/Flip';
import { FX_EVENTS } from '@game/engine/src/client/controllers/fx-controller';

const ui = useGameUi();
const cardRotation = ref({ x: 0, y: 0 });
const x = ref(0);
const y = ref(0);

useEventListener(
  'mousemove',
  (e: MouseEvent) => {
    x.value = e.clientX;
    y.value = e.clientY;
  },
  { passive: true, capture: true }
);
let prev = { x: x.value, y: y.value };
let delta = { x: 0, y: 0 };
const MAX_ANGLE = 45;
const SCALE_FACTOR = 1.4;
const LERP_FACTOR = 0.3;

const rotationAnimation = useRafFn(() => {
  delta = {
    x: x.value - prev.x,
    y: y.value - prev.y
  };

  prev = { x: x.value, y: y.value };

  cardRotation.value = {
    x: lerp(
      cardRotation.value.x,
      Math.round(
        Math.max(Math.min(delta.y * SCALE_FACTOR, MAX_ANGLE), -MAX_ANGLE) * -1
      ),
      LERP_FACTOR
    ),
    y: lerp(
      cardRotation.value.y,
      Math.round(
        Math.max(Math.min(delta.x * SCALE_FACTOR, MAX_ANGLE), -MAX_ANGLE)
      ),
      LERP_FACTOR
    )
  };
});

const state = useGameState();
const isPinned = ref(false);
const isPinning = ref(false);
const { client } = useGameClient();

const container = useTemplateRef<HTMLDivElement>('container');
watchEffect(() => {
  const shouldPin =
    state.value.interaction.state !== INTERACTION_STATES.PLAYING_CARD &&
    !isDefined(ui.value.draggedCard);
  if (shouldPin === isPinned.value) return;

  if (shouldPin) {
    if (!container.value) return;

    const flipState = Flip.getState(container.value);
    isPinning.value = true;
    isPinned.value = shouldPin;
    window.requestAnimationFrame(() => {
      Flip.from(flipState, {
        targets: container.value,
        duration: 0.25,
        absolute: true,
        ease: Power1.easeOut,
        onComplete() {
          isPinning.value = false;
        }
      });
    });
  } else {
    isPinned.value = shouldPin;
  }
});

watch(isPinned, pinned => {
  if (pinned) {
    rotationAnimation.pause();
  } else {
    rotationAnimation.resume();
  }
});

const isHidden = ref(false);
useFxEvent(FX_EVENTS.PRE_CARD_BEFORE_PLAY, () => {
  isHidden.value = true;
});
const unsub = client.value.onUpdateCompleted(() => {
  isHidden.value = false;
});
onBeforeUnmount(() => {
  unsub();
});
</script>

<template>
  <Teleport to="#dragged-card-container" defer>
    <div
      v-if="!isHidden"
      ref="container"
      id="dragged-card"
      data-flip-id="dragged-card"
      :class="{
        'is-pinned': isPinned,
        'is-pinning': isPinning
      }"
      :style="{
        '--pixel-scale': 1.5,
        '--x': `${x}px`,
        '--y': `${y}px`
      }"
    >
      <slot />
    </div>
  </Teleport>
</template>

<style lang="postcss" scoped>
#dragged-card {
  pointer-events: none !important;
  position: fixed;
  z-index: 99;
  transform-style: preserve-3d;
  transform-origin: center center;

  &:not(.is-pinned) {
    top: 0;
    left: 0;
    transform: translateY(var(--y)) translateX(calc(-50% + var(--x)))
      rotateX(calc(1deg * v-bind('cardRotation.x')))
      rotateY(calc(1deg * v-bind('cardRotation.y')));
  }
  &.is-pinned {
    top: var(--size-13);
    right: var(--size-8);
  }
}
</style>
