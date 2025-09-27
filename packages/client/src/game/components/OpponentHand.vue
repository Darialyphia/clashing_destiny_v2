<script setup lang="ts">
import {
  useFxEvent,
  useGameClient,
  useGameState,
  useOpponentBoard
} from '@/game/composables/useGameClient';
import { FX_EVENTS } from '@game/engine/src/client/controllers/fx-controller';
import { clamp } from '@game/shared';
import type { CardViewModel } from '@game/engine/src/client/view-models/card.model';
import { useResizeObserver } from '@vueuse/core';
import CardBack from '@/card/components/CardBack.vue';

const state = useGameState();
const opponentBoard = useOpponentBoard();
const client = useGameClient();

useFxEvent(FX_EVENTS.CARD_ADD_TO_HAND, async () => {
  // const newCard = e.card as SerializedCard;
  // if (newCard.player !== opponentBoard.value.playerId) return;
  // // @FIXME this can happen on P1T1, this will probaly go away once mulligan is implemented
  // if (opponentBoard.value.hand.includes(newCard.id)) return;
  // if (isDefined(e.index)) {
  //   opponentBoard.value.hand.splice(e.index, 0, newCard.id);
  // } else {
  //   opponentBoard.value.hand.push(newCard.id);
  // }
  // await nextTick();
  // const el = document.querySelector(
  //   client.value.ui.getCardDOMSelectorInHand(newCard.id, opponentBoard.value.playerId)
  // );
  // if (el) {
  //   await el.animate(
  //     [
  //       { transform: 'translateY(-50%)', opacity: 0 },
  //       { transform: 'none', opacity: 1 }
  //     ],
  //     {
  //       duration: 300,
  //       easing: 'ease-out'
  //     }
  //   ).finished;
  // }
});

const handContainer = useTemplateRef('hand');
const handContainerSize = ref({ w: 0, h: 0 });

useResizeObserver(handContainer, () => {
  const el = handContainer.value;
  if (!el) return;
  const rect = el.getBoundingClientRect();
  handContainerSize.value = { w: rect.width, h: rect.height };
});

const pixelScale = computed(() => {
  let el = handContainer.value;
  if (!el) return 1;
  let scale = getComputedStyle(el).getPropertyValue('--pixel-scale');
  while (!scale) {
    if (!el.parentElement) return 1;
    el = el.parentElement;
    scale = getComputedStyle(el).getPropertyValue('--pixel-scale');
  }

  return parseInt(scale) || 1;
});

const cardW = computed(() => {
  return (
    parseInt(
      getComputedStyle(document.documentElement).getPropertyValue(
        '--card-width-unitless'
      )
    ) * pixelScale.value
  );
});

const handSize = computed(() => opponentBoard.value.hand.length);

const step = computed(() => {
  if (handSize.value <= 1) return 0;
  const natural =
    (handContainerSize.value.w - cardW.value) / (handSize.value - 1);
  return clamp(natural, 0, cardW.value);
});

const cards = computed(() => {
  if (handSize.value === 0) return [];
  const usedSpan = cardW.value + (handSize.value - 1) * step.value;
  const offset = (handContainerSize.value.w - usedSpan) / 2;

  return opponentBoard.value.hand.map((cardId, i) => ({
    card: state.value.entities[cardId] as CardViewModel,
    x: offset + i * step.value,
    z: i
  }));
});
</script>

<template>
  <section
    :id="`hand-${opponentBoard.playerId}`"
    class="opponent-hand"
    :class="{
      'ui-hidden': !client.ui.displayedElements.hand
    }"
    :style="{ '--hand-size': opponentBoard.hand.length }"
    ref="hand"
  >
    <div
      class="hand-card"
      v-for="card in cards"
      :key="card.card.id"
      :style="{
        '--x': `${card.x}px`,
        '--z': card.z
      }"
    >
      <CardBack />
    </div>
  </section>
</template>

<style scoped lang="postcss">
.opponent-hand {
  --pixel-scale: 2;
  z-index: 1;
  position: relative;
}

.hand-card {
  position: absolute;
  right: 0;
  top: 0;
  transform-origin: 50% 100%;
  transform: translateX(calc(-1 * var(--x)));
  z-index: var(--z);
  transition: transform 0.2s var(--ease-2);
  pointer-events: auto;
}
</style>
