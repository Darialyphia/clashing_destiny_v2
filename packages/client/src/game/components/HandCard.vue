<script setup lang="ts">
import type { CardViewModel } from '@game/engine/src/client/view-models/card.model';
import { useGameState, useGameUi } from '../composables/useGameClient';
import GameCard from './GameCard.vue';
import { GAME_PHASES } from '@game/engine/src/game/game.enums';
import CardBack from '@/card/components/CardBack.vue';
const {
  card,
  isInteractive,
  hoverYOffset = 0,
  hoverScale = 1.5
} = defineProps<{
  card?: CardViewModel;
  isInteractive: boolean;
  hoverYOffset?: number;
  hoverScale?: number;
}>();

const ui = useGameUi();
const state = useGameState();

const DRAG_THRESHOLD_PX = 60;

const isShaking = ref(false);
const violationWarning = ref('');

const playViolationAnimation = () => {
  isShaking.value = true;
  violationWarning.value =
    card?.unplayableReason || 'You cannot play this card.';

  setTimeout(() => {
    violationWarning.value = '';
    isShaking.value = false;
  }, 2500);
};

let startY = 0;
const onMousemove = (e: MouseEvent) => {
  if (!card) return;
  const deltaY = startY - e.clientY;
  if (deltaY >= DRAG_THRESHOLD_PX && !ui.value.draggedCard) {
    ui.value.startDraggingCard(card);
    card.play();
    document.body.removeEventListener('mousemove', onMousemove);
  }
};

const onMouseDown = (e: MouseEvent) => {
  if (!card) return;
  if (!ui.value.isInteractivePlayer) return;

  if (!card.canPlay) return playViolationAnimation();

  ui.value.select(card);
  startY = e.clientY;

  document.body.addEventListener('mousemove', onMousemove);
};

const isDisabled = computed(() => {
  return !card?.canPlay;
});

const isVisible = computed(() => {
  if (state.value.phase.state !== GAME_PHASES.PLAY_CARD) return true;
  if (ui.value.optimisticState.isCancellingPlayCard) return true;
  return state.value.phase.ctx.card !== card?.id;
});
</script>

<template>
  <div
    class="hand-card"
    :class="[
      {
        selected: card ? ui.selectedCard?.equals(card) : false,
        disabled: isDisabled,
        'is-shaking': isShaking,
        hoverable: ui.draggedCard === null
      },
      card?.keywords.map(k => `keyword-${k.toLocaleLowerCase()}`)
    ]"
    :style="{ '--hover-y-offset': hoverYOffset, '--hover-scale': hoverScale }"
    @mousedown="onMouseDown($event)"
  >
    <p class="violation-warning" v-if="violationWarning">
      {{ violationWarning }}
    </p>

    <GameCard
      v-if="card && isVisible"
      :id="ui.DOMSelectors.cardInHand(card.id, card.player.id).id"
      :card-id="card.id"
      actions-side="top"
      :actions-offset="15"
      :is-interactive="isInteractive"
      show-disabled-message
      @mouseenter="ui.hoverCardInHand(card)"
      @mouseleave="ui.unhoverCardInHand()"
    />
    <CardBack v-else-if="!card" class="hand-card-flipped" />
  </div>
</template>

<style scoped lang="postcss">
@keyframes keyword-fleeting {
  0%,
  20%,
  80%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.65;
  }
}
.hand-card {
  position: absolute;
  left: 0;
  --hover-offset: 0px;
  --offset-y: var(--hover-offset);
  --scale: 1;
  transform-origin: 0% 100%;
  transform: translateX(var(--x)) translateY(var(--offset-y))
    scale(var(--scale));
  z-index: var(--z);
  transition:
    transform 0.2s var(--ease-2),
    filter 1s var(--ease-2);
  pointer-events: auto;
  @starting-style {
    filter: brightness(3.5) saturate(2) !important;
  }
  &.hoverable:hover {
    --scale: var(--hover-scale);
    --hover-offset: calc(var(--hover-y-offset) * 1px);
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

  &.is-shaking > :not(.violation-warning) {
    animation: var(--animation-shake-x);
    animation-duration: 0.3s;
  }
  &.keyword-fleeting {
    animation: keyword-fleeting 3s infinite;
    &::after {
      content: '';
      position: absolute;
      inset: 0;
      box-shadow: inset 0 0 20px 5px var(--cyan-4);
      z-index: 1;
    }
    &:before {
      content: 'Fleeting';
      position: absolute;
      top: 0;
      inset: initial;
      left: 50%;
      translate: -50% 0;
      padding: var(--size-1) var(--size-2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: var(--font-size-0);
      color: var(--cyan-4);
      z-index: 2;
      background: hsla(0 0% 0% / 0.45);
      filter: none;
      border: solid 1px var(--cyan-4);
      font-style: italic;
    }
  }
}

.violation-warning {
  position: absolute;
  bottom: calc(100% + var(--size-3));
  left: 50%;
  transform: translateX(-50%);
  color: white;
  text-align: center;
  font-size: var(--size-3);
  font-weight: var(--font-weight-5);
  width: 100%;
  -webkit-text-stroke: 4px black;
  paint-order: stroke fill;
  color: var(--red-5);
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
