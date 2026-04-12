<script setup lang="ts">
import type { CardViewModel } from '@game/engine/src/client/view-models/card.model';
import { useGameState, useGameUi } from '../composables/useGameClient';
import GameCard from './GameCard.vue';

const { card, isInteractive } = defineProps<{
  card: CardViewModel;
  isInteractive: boolean;
}>();

const ui = useGameUi();
const state = useGameState();

const DRAG_THRESHOLD_PX = 60;

const isShaking = ref(false);
const violationWarning = ref('');

const startDragging = (e: MouseEvent) => {
  ui.value.selectCard(card);
  startY.value = e.clientY;

  document.body.addEventListener('mousemove', onMousemove);
};

const playViolationAnimation = () => {
  isShaking.value = true;
  violationWarning.value =
    card.unplayableReason || 'You cannot play this card.';

  setTimeout(() => {
    violationWarning.value = '';
    isShaking.value = false;
  }, 2500);
};

const startY = ref(0);

const onMousemove = (e: MouseEvent) => {
  const deltaY = startY.value - e.clientY;
  if (deltaY >= DRAG_THRESHOLD_PX && !ui.value.draggedCard) {
    ui.value.draggedCard = card;
    card.play();
    document.body.removeEventListener('mousemove', onMousemove);
  }
};

const onMouseDown = (e: MouseEvent) => {
  if (ui.value.isReplacingCard) return;
  if (state.value.turnPlayer !== card.player.id) return;

  if (!card.canPlay) return playViolationAnimation();

  startDragging(e);
};

const isDisabled = computed(() => {
  if (ui.value.isReplacingCard) {
    return !card.canReplace;
  }
  return !card.canPlay;
});

const isVisible = computed(() => {
  return state.value.phase.ctx.card !== card.id;
});
</script>

<template>
  <Sound mouseenter="button-hover" pitch-shift>
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
        v-if="isVisible"
        :card-id="card.id"
        actions-side="top"
        :actions-offset="15"
        :is-interactive="isInteractive"
        show-disabled-message
      />
    </div>
  </Sound>
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
  z-index: var(--z);
  transition:
    transform 0.2s var(--ease-2),
    filter 1s var(--ease-2);
  pointer-events: auto;

  @starting-style {
    filter: brightness(3.5) saturate(2) !important;
  }
  &:hover {
    --hover-offset: -120px;
    z-index: var(--hand-size);
  }

  &:not(.disabled) {
    &::before {
      content: '';
      position: absolute;
      inset: 0;
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
