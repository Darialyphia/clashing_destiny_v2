<script setup lang="ts">
import { lerp } from '@game/shared';
import { useEventListener, useRafFn } from '@vueuse/core';
import {
  useGameState,
  useGameClient,
  useFxEvent
} from '../composables/useGameClient';
import {
  GAME_PHASES,
  INTERACTION_STATES
} from '@game/engine/src/game/game.enums';
import { FX_EVENTS } from '@game/engine/src/client/controllers/fx-controller';
import type { CardViewModel } from '@game/engine/src/client/view-models/card.model';
import GameCard from './GameCard.vue';

const cardRotation = ref({ x: 0, y: 0 });
const x = ref(0);
const y = ref(0);

const POSITION_OFFSET_Y = -0;
useEventListener(
  'mousemove',
  (e: MouseEvent) => {
    x.value = e.clientX;
    y.value = e.clientY + POSITION_OFFSET_Y;
  },
  { passive: true, capture: true }
);
let prev = { x: x.value, y: y.value };
let delta = { x: 0, y: 0 };
const MAX_ANGLE = 45;
const SCALE_FACTOR = 5;
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
const { client, playerId } = useGameClient();

const isHidden = ref(false);
useFxEvent(FX_EVENTS.PRE_CARD_BEFORE_PLAY, () => {
  isHidden.value = true;
});
useFxEvent(FX_EVENTS.INTERACTION_AFTER_CHANGE_STATE, event => {
  if (event.to.state === INTERACTION_STATES.IDLE) {
    isHidden.value = true;
  }
});
useFxEvent(FX_EVENTS.CARD_BEFORE_PLAY, () => {
  isHidden.value = true;
});
const unsub = client.value.onUpdateCompleted(() => {
  isHidden.value = false;
});
onBeforeUnmount(() => {
  unsub();
});

const draggedCard = computed(() => {
  let card: CardViewModel | null = null;
  if (client.value.optimisticStateManager.state.playedCardId) {
    card = state.value.entities[
      client.value.optimisticStateManager.state.playedCardId
    ] as CardViewModel;
  } else if (state.value.phase.state == GAME_PHASES.PLAY_CARD) {
    card = state.value.entities[state.value.phase.ctx.card] as CardViewModel;
  }

  if (card?.player.id !== playerId.value) card = null;

  return card;
});

watch(draggedCard, draggedCard => {
  if (draggedCard) {
    rotationAnimation.pause();
  } else {
    rotationAnimation.resume();
  }
});
</script>

<template>
  <div
    v-if="!isHidden"
    ref="container"
    id="dragged-card"
    data-flip-id="dragged-card"
    :style="{
      '--pixel-scale': 1,
      '--x': `${x}px`,
      '--y': `${y}px`
    }"
  >
    <GameCard
      v-if="draggedCard"
      :card-id="draggedCard.id"
      :is-interactive="false"
    />
  </div>
</template>

<style lang="postcss" scoped>
#dragged-card {
  pointer-events: none !important;
  position: fixed;
  z-index: 99;
  transform-style: preserve-3d;
  transform-origin: center center;
  top: 0;
  left: 0;
  transform: translateY(var(--y)) translateX(calc(-50% + var(--x)))
    rotateX(calc(1deg * v-bind('cardRotation.x')))
    rotateY(calc(1deg * v-bind('cardRotation.y')));
}
</style>
