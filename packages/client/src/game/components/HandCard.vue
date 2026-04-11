<script setup lang="ts">
import type { CardViewModel } from '@game/engine/src/client/view-models/card.model';
import {
  useGameClient,
  useGameState,
  useGameUi
} from '../composables/useGameClient';
import GameCard from './GameCard.vue';
import { GAME_PHASES } from '@game/engine/src/game/game.enums';
import CardBack from '@/card/components/CardBack.vue';

const { cardId } = defineProps<{
  cardId?: string;
}>();

const ui = useGameUi();
const { client } = useGameClient();
const state = useGameState();
const card = computed(() => {
  if (!cardId) return null;
  return (state.value.entities[cardId] as CardViewModel) ?? null;
});
const DRAG_THRESHOLD_PX = 60;

const isShaking = ref(false);
const violationWarning = ref('');

const startDragging = (e: MouseEvent) => {
  if (!card.value) return;
  ui.value.select(card.value);
  startY.value = e.clientY;

  document.body.addEventListener('mousemove', onMousemove);
};

const playViolationAnimation = () => {
  if (!card.value) return;
  isShaking.value = true;
  violationWarning.value =
    card.value.unplayableReason || 'You cannot play this card.';

  setTimeout(() => {
    violationWarning.value = '';
    isShaking.value = false;
  }, 2500);
};

const startY = ref(0);

const onMousemove = (e: MouseEvent) => {
  if (!card.value) return;
  const deltaY = startY.value - e.clientY;
  if (deltaY >= DRAG_THRESHOLD_PX && !ui.value.draggedCard) {
    ui.value.startDraggingCard(card.value);
    card.value.play();
    document.body.removeEventListener('mousemove', onMousemove);
  }
};

const onMouseDown = (e: MouseEvent) => {
  if (!card.value) return;
  if (client.value.getActivePlayerId() !== card.value.player.id) return;

  if (!card.value.canPlay) return playViolationAnimation();

  startDragging(e);
};

const isDisabled = computed(() => {
  return !card.value?.canPlay;
});

const isVisible = computed(() => {
  const phase = state.value.phase;
  if (phase.state === GAME_PHASES.PLAYING_CARD) {
    return phase.ctx.card !== card.value?.id;
  }

  return true;
});
</script>

<template>
  <div
    class="hand-card"
    :class="{
      selected: card && ui.selectedCard?.equals(card),
      disabled: isDisabled,
      'is-shaking': isShaking
    }"
    @mousedown="onMouseDown($event)"
  >
    <p class="violation-warning" v-if="violationWarning">
      {{ violationWarning }}
    </p>

    <GameCard
      v-if="card"
      v-show="isVisible"
      :card-id="card.id"
      actions-side="top"
      :actions-offset="15"
      :is-interactive="false"
      show-disabled-message
    />
    <CardBack v-else-if="!card" />
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
  z-index: var(--z);
  transition:
    transform 0.2s var(--ease-2),
    filter 1s var(--ease-2);
  pointer-events: auto;

  @starting-style {
    filter: brightness(3.5) saturate(2) !important;
  }
  &:hover {
    --hover-offset: -40px;
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
