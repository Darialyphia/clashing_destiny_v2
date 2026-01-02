<script setup lang="ts">
import type { CardViewModel } from '@game/engine/src/client/view-models/card.model';
import {
  useGameClient,
  useGameState,
  useGameUi
} from '../composables/useGameClient';
import GameCard from './GameCard.vue';
import { usePageLeave } from '@vueuse/core';
import { INTERACTION_STATES } from '@game/engine/src/game/game.enums';

const { card, isInteractive } = defineProps<{
  card: CardViewModel;
  isInteractive: boolean;
}>();

const ui = useGameUi();
const state = useGameState();
const { client } = useGameClient();

const DRAG_THRESHOLD_PX = 60;

const isOutOfScreen = usePageLeave();

const isShaking = ref(false);
const violationWarning = ref('');

const unselectCard = () => {
  const el = document.querySelector('#dragged-card [data-game-card]');
  if (!el) return;
  // @FIXME issue will scrollbar briefly appearing on the screen, lets disable the animation for now
  // const flipState = Flip.getState(el);
  // window.requestAnimationFrame(() => {
  //   const target = document.querySelector(
  //     `.hand-card [data-game-card="${card.id}"]`
  //   );
  //   Flip.from(flipState, {
  //     targets: target,
  //     duration: 0.25,
  //     absolute: true,
  //     ease: Power1.easeOut
  //   });
  // });
};
const onMouseDown = (e: MouseEvent) => {
  if (!client.value.isActive()) {
    return;
  }
  if (state.value.interaction.state !== INTERACTION_STATES.IDLE) {
    return;
  }
  if (!card.canPlay) {
    isShaking.value = true;
    violationWarning.value =
      card.unplayableReason ?? 'You cannot play this card.';

    setTimeout(() => {
      violationWarning.value = '';
      isShaking.value = false;
    }, 2500);
    return;
  }

  const startY = e.clientY;

  const stopDragging = () => {
    nextTick(() => {
      ui.value.stopDraggingCard();
    });
    document.body.removeEventListener('mouseup', onMouseup);
    document.body.removeEventListener('mousemove', onMousemove);
  };

  const onMousemove = (e: MouseEvent) => {
    const deltaY = startY - e.clientY;
    if (deltaY >= DRAG_THRESHOLD_PX && !ui.value.draggedCard) {
      ui.value.startDraggingCard(card);
      document.body.removeEventListener('mousemove', onMousemove);
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
    [isOutOfScreen, () => ui.value.draggedCard],
    ([outOfScreen, draggedCard]) => {
      if (outOfScreen && draggedCard) {
        stopDragging();
        unselectCard();
        unwatch();
      }
    }
  );
};

const isDetachedFromHand = computed(() => {
  if (ui.value.draggedCard?.equals(card)) return true;
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
    <GameCard
      v-if="!isDetachedFromHand"
      :card-id="card.id"
      actions-side="top"
      :actions-offset="15"
      :is-interactive="isInteractive && !ui.draggedCard"
      class="game-card"
      :show-action-empty-state="false"
    />
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
    transform 0.15s var(--ease-elastic-2),
    filter 1s var(--ease-2);
  pointer-events: auto;

  &:hover {
    --hover-offset: -20px;
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
      border-radius: var(--radius-3);
      background: conic-gradient(
        from var(--hand-card-conic-gradient-angle) at center,
        cyan 0deg,
        orange 40deg,
        transparent 40deg
      );
      animation: booster-border-gradient-rotate 2s linear infinite;
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
