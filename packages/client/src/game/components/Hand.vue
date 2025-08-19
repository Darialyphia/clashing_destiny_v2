<script setup lang="ts">
import {
  useFxEvent,
  useGameClient,
  useGameState,
  useGameUi,
  useMyBoard
} from '@/game/composables/useGameClient';
import GameCard from '@/game/components/GameCard.vue';
import { FX_EVENTS } from '@game/engine/src/client/controllers/fx-controller';
import type { SerializedCard } from '@game/engine/src/card/entities/card.entity';
import { isDefined } from '@game/shared';
import type { CardViewModel } from '@game/engine/src/client/view-models/card.model';
import { INTERACTION_STATES } from '@game/engine/src/game/systems/game-interaction.system';

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
  const base = 184;
  const amount = handSize > 6 ? base - 10 * (handSize - 6) : base;

  return amount % 2 === 0 ? amount : amount - 1; // Ensure even number to avoid image-rendering: pixelated working
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

const state = useGameState();
const displayedCards = computed(() => {
  return myBoard.value.hand.map(cardId => {
    return state.value.entities[cardId] as CardViewModel;
  });
});

const isInteractionActive = computed(() => {
  return (
    state.value.interaction.state === INTERACTION_STATES.PLAYING_CARD ||
    state.value.interaction.state === INTERACTION_STATES.USING_ABILITY
  );
});
</script>

<template>
  <section
    :id="`hand-${myBoard.playerId}`"
    class="hand"
    :class="{
      'ui-hidden': !client.ui.displayedElements.hand,
      'interaction-active': isInteractionActive
    }"
    :style="{ '--hand-size': myBoard.hand.length, '--angle': angle }"
  >
    <div
      class="card"
      v-for="(card, index) in displayedCards"
      :key="card.id"
      :class="{
        selected: ui.selectedCard?.id === card.id
      }"
      :style="{
        '--index': index,
        '--offset': Math.abs(index - myBoard.hand.length / 2)
      }"
    >
      <GameCard
        :card-id="card.id"
        class="hand-card"
        :class="{ disabled: !card.canPlay }"
      />
    </div>
  </section>
</template>

<style scoped lang="postcss">
.hand {
  position: relative;
  z-index: 1;
  display: grid;
  justify-items: center;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;
  --offset-step: calc(1px * v-bind(cardSpacing));

  &:has(:hover) > *,
  &.interaction-active > * {
    --offset-step: calc(1px * v-bind(cardSpacingHovered));
    --y-offset: -50%;
  }

  > * {
    grid-row: 1;
    grid-column: 1;
    position: relative;
    --base-angle: calc((var(--hand-size) * 0.4) * var(--angle) * -1deg);
    --base-offset: calc((var(--hand-size) / 2) * var(--offset-step) * -1);
    --rotation: calc(var(--base-angle) + var(--index) * var(--angle) * 1deg);
    /* --rotation: 0deg; */
    /* --y-offset: calc(var(--offset) * 10px); */
    --y-offset: 0;
    transform-origin: center 120%;
    transform: translateX(
        calc(var(--base-offset) + (var(--index) + 0.5) * var(--offset-step))
      )
      translateY(var(--y-offset)) rotate(var(--rotation));
    transition: transform 0.2s ease-out;

    .hand:hover &,
    .hand.interaction-active & {
      --rotation: 0deg;
    }
    &:is(:hover, .selected) {
      z-index: 1;
      --y-offset: -62%;
      transform: translateX(
          calc(var(--base-offset) + (var(--index) + 0.5) * var(--offset-step))
        )
        translateY(var(--y-offset));
    }
  }
}

.hand-card {
  /* filter: drop-shadow(0 0 15px hsl(var(--lime-4-hsl) / 0.25)); */
  &.disabled {
    filter: brightness(0.75) grayscale(0.3);
  }
}

@media (width < 1024px) {
  .hand {
    transform: scale(0.5);
  }
}
</style>
