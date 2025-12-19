<script setup lang="ts">
import { Teleport } from 'vue';
import type { CardViewModel } from '@game/engine/src/client/view-models/card.model';
import { useGameState, useGameUi } from '../composables/useGameClient';
import GameCard from './GameCard.vue';
import { usePageLeave } from '@vueuse/core';
import { Flip } from 'gsap/Flip';
import { INTERACTION_STATES } from '@game/engine/src/game/systems/game-interaction.system';

const { card, isInteractive } = defineProps<{
  card: CardViewModel;
  isInteractive: boolean;
}>();

const ui = useGameUi();
const state = useGameState();

const DRAG_THRESHOLD_PX = 60;

const isOutOfScreen = usePageLeave();
const isDragging = ref(false);

const isShaking = ref(false);
const violationWarning = ref('');

const unselectCard = () => {
  const el = document.querySelector('#dragged-card [data-game-card]');
  if (!el) return;

  const flipState = Flip.getState(el);
  ui.value.unselect();
  window.requestAnimationFrame(() => {
    const target = document.querySelector(
      `.hand-card [data-game-card="${card.id}"]`
    );
    Flip.from(flipState, {
      targets: target,
      duration: 0.25,
      absolute: true,
      ease: Power1.easeOut
    });
  });
};
const onMouseDown = (e: MouseEvent) => {
  return;
  if (state.value.currentPlayer !== card.player.id) {
    return;
  }
  if (!card.canPlay) {
    isShaking.value = true;
    violationWarning.value = 'You cannot play this card.';

    setTimeout(() => {
      violationWarning.value = '';
      isShaking.value = false;
    }, 2500);
    return;
  }

  ui.value.select(card);

  const startY = e.clientY;

  const stopDragging = () => {
    nextTick(() => {
      isDragging.value = false;
    });
    document.body.removeEventListener('mouseup', onMouseup);
    document.body.removeEventListener('mousemove', onMousemove);
  };

  const onMousemove = (e: MouseEvent) => {
    const deltaY = startY - e.clientY;
    if (deltaY >= DRAG_THRESHOLD_PX && !isDragging.value) {
      isDragging.value = true;
      card.play();
    }
  };

  const onMouseup = () => {
    // if (app.value.view !== e.target) {
    //   ui.value.unselect();
    // }
    unselectCard();
    stopDragging();
  };

  document.body.addEventListener('mousemove', onMousemove);
  document.body.addEventListener('mouseup', onMouseup);
  const unwatch = watch(
    [
      () => state.value.interaction.state,
      isOutOfScreen,
      () => ui.value.selectedCard
    ],
    ([newState, outOfScreen, selectedCard]) => {
      if (newState !== INTERACTION_STATES.PLAYING_CARD) {
        stopDragging();
        unselectCard();
        unwatch();
        return;
      }
      if (outOfScreen && selectedCard) {
        stopDragging();
        unselectCard();
        unwatch();
        return;
      }
    }
  );
};

const isDetachedFromHand = computed(() => {
  if (isDragging.value) return true;
  return (
    state.value.interaction.state === INTERACTION_STATES.PLAYING_CARD &&
    state.value.interaction.ctx.card === card.id &&
    !card.isSelected
  );
});

const isDisabled = computed(() => {
  return !card.canPlay;
});
</script>

<template>
  <div
    class="hand-card"
    :class="{
      selected: ui.selectedCard?.equals(card),
      disabled: isDisabled,
      'is-shaking': isShaking
    }"
    @mousedown="onMouseDown($event)"
  >
    <p class="violation-warning" v-if="violationWarning">
      {{ violationWarning }}
    </p>
    <component :is="isDetachedFromHand ? Teleport : 'div'" to="#dragged-card">
      <GameCard
        :card-id="card.id"
        actions-side="top"
        :actions-offset="15"
        :is-interactive="isInteractive"
        class="game-card"
      />
    </component>
  </div>
</template>

<style scoped lang="postcss">
.hand-card {
  position: absolute;
  left: 0;
  --hover-offset: 0px;
  --offset-y: var(--hover-offset);
  --_y: var(--offset-y);
  transform-origin: 50% 100%;
  transform: translateX(var(--x)) translateY(var(--_y));
  padding-block: var(--size-3) var(--size-6);
  z-index: var(--z);
  transition:
    transform 0.2s var(--ease-2),
    filter 1s var(--ease-2);
  pointer-events: auto;

  &:hover {
    --hover-offset: -30px;
    z-index: var(--hand-size);
  }

  &:not(.disabled) {
    &::before {
      content: '';
      position: absolute;
      top: var(--size-2);
      bottom: var(--size-5);
      left: calc(-1 * var(--size-1));
      right: calc(-1 * var(--size-1));
      z-index: -1;
      filter: blur(4px);
      background:
        conic-gradient(
          from var(--hand-card-conic-gradient-angle) at center,
          cyan 0deg,
          orange 40deg,
          transparent 40deg
        ),
        conic-gradient(
          from var(--hand-card-conic-gradient-angle-2) at center,
          magenta 0deg,
          yellow 40deg,
          transparent 40deg
        );
      animation: booster-border-gradient-rotate 4s linear infinite;
    }
  }
  &.disabled {
    filter: brightness(0.8);
  }
  &.is-shaking > :not(.violation-warning) {
    animation: var(--animation-shake-x);
    animation-duration: 0.3s;
  }
}

.violation-warning {
  position: absolute;
  bottom: calc(100% + var(--size-3));
  left: 50%;
  transform: translateX(-50%);
  color: white;
  text-align: center;
  font-size: var(--size-4);
  font-weight: var(--font-weight-5);
  width: 100%;
  -webkit-text-stroke: 4px black;
  paint-order: stroke fill;
}

@property --hand-card-conic-gradient-angle {
  syntax: '<angle>';
  inherits: false;
  initial-value: 0deg;
}
@property --hand-card-conic-gradient-angle-2 {
  syntax: '<angle>';
  inherits: false;
  initial-value: 0deg;
}

@keyframes booster-border-gradient-rotate {
  from {
    --hand-card-conic-gradient-angle: 0deg;
    --hand-card-conic-gradient-angle-2: 0deg;
  }
  to {
    --hand-card-conic-gradient-angle: 360deg;
    --hand-card-conic-gradient-angle-2: -360deg;
  }
}
</style>
