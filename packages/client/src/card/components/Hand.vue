<script setup lang="ts">
import {
  useFxEvent,
  useGameClient,
  useGameUi,
  useMyBoard
} from '@/game/composables/useGameClient';
import GameCard from '@/game/components/GameCard.vue';
import { FX_EVENTS } from '@game/engine/src/client/controllers/fx-controller';
import type { SerializedCard } from '@game/engine/src/card/entities/card.entity';
import { isDefined, waitFor } from '@game/shared';

const myBoard = useMyBoard();
const ui = useGameUi();
const client = useGameClient();

const cardSpacing = computed(() => {
  const handSize = myBoard.value.hand.length;
  const base = 130;
  return handSize > 7 ? base - 0 * (handSize - 6) : base;
});
const cardSpacingHovered = computed(() => {
  const handSize = myBoard.value.hand.length;
  const base = 185;
  return handSize > 6 ? base - 10 * (handSize - 6) : base;
});

const angle = computed(() => {
  const handSize = myBoard.value.hand.length;
  return handSize > 7 ? 5 - (handSize - 6) * 0.5 : 5;
});

useFxEvent(FX_EVENTS.CARD_ADD_TO_HAND, async e => {
  const newCard = e.card as SerializedCard;
  if (newCard.player !== myBoard.value.playerId) return;

  // @FIXME this can happen on P1T1, this will probaly go away once mulligan is implemented
  if (myBoard.value.hand.includes(newCard.id)) return;

  if (isDefined(e.index)) {
    myBoard.value.hand.splice(e.index, 0, newCard.id);
  } else {
    myBoard.value.hand.push(newCard.id);
  }
  await nextTick();

  const el = document.querySelector(
    client.value.ui.getCardDOMSelectorInHand(newCard.id, myBoard.value.playerId)
  );
  if (el) {
    await el.animate(
      [
        { transform: 'translateY(-50%)', opacity: 0 },
        { transform: 'none', opacity: 1 }
      ],
      {
        duration: 300,
        easing: 'ease-out'
      }
    ).finished;
  }
});
</script>

<template>
  <section
    :id="`hand-${myBoard.playerId}`"
    class="hand"
    :style="{ '--hand-size': myBoard.hand.length, '--angle': angle }"
  >
    <div
      class="card"
      v-for="(cardId, index) in myBoard.hand"
      :key="cardId"
      :class="{
        selected: ui.selectedCard?.id === cardId
      }"
      :style="{
        '--index': index,
        '--offset': Math.abs(index - myBoard.hand.length / 2)
      }"
    >
      <GameCard :card-id="cardId" />
    </div>
  </section>
</template>

<style scoped lang="postcss">
.hand {
  position: fixed;
  bottom: 0;
  height: 250px;
  width: 100%;
  z-index: 1;
  display: grid;
  justify-items: center;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;
  --offset-step: calc(1px * v-bind(cardSpacing));

  &:has(:hover) {
    --offset-step: calc(1px * v-bind(cardSpacingHovered));
  }

  > * {
    grid-row: 1;
    grid-column: 1;
    position: relative;

    --base-angle: calc((var(--hand-size) * 0.4) * var(--angle) * -1deg);
    --base-offset: calc((var(--hand-size) / 2) * var(--offset-step) * -1);
    --rotation: calc(var(--base-angle) + var(--index) * var(--angle) * 1deg);
    /* --rotation: 0deg; */
    --y-offset: calc(var(--offset) * 10px - 2rem);
    transform-origin: center 120%;
    transform: translateX(
        calc(var(--base-offset) + (var(--index) + 0.5) * var(--offset-step))
      )
      rotate(var(--rotation)) translateY(var(--y-offset));
    transition: transform 0.2s ease-out;

    &:is(:hover, .selected) {
      z-index: 1;
      --y-offset: -13rem;
      --counter-rotation: calc(var(--rotation) * -1);
      transform: translateX(
          calc(var(--base-offset) + (var(--index) + 0.5) * var(--offset-step))
        )
        translateY(var(--y-offset));
    }
  }
}
</style>
