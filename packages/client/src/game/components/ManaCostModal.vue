<script setup lang="ts">
import UiModal from '@/ui/components/UiModal.vue';
import FancyButton from '@/ui/components/FancyButton.vue';
import {
  useGameClient,
  useGameState,
  useMyBoard
} from '../composables/useGameClient';
import GameCard from './GameCard.vue';
import { INTERACTION_STATES } from '@game/engine/src/game/systems/game-interaction.system';
import type { CardViewModel } from '@game/engine/src/client/view-models/card.model';

const board = useMyBoard();
const isShowingBoard = ref(false);
const state = useGameState();
const client = useGameClient();
const isOpened = computed(() => {
  return client.value.ui.isManaCostOverlayOpened;
});

const displayedCards = computed(() => {
  if (state.value.interaction.state !== INTERACTION_STATES.PLAYING_CARD)
    return [];
  const { card } = state.value.interaction.ctx;
  return board.value.hand
    .filter(cardId => {
      return cardId !== card;
    })
    .map(id => ({
      cardId: id,
      indexInHand: board.value.hand.findIndex(c => c === id)
    }));
});

const playedCardId = computed(() => {
  if (state.value.interaction.state !== INTERACTION_STATES.PLAYING_CARD)
    return null;
  return state.value.interaction.ctx.card;
});
const playedCard = computed(() => {
  if (!playedCardId.value) return null;
  return state.value.entities[playedCardId.value] as CardViewModel;
});

const selectedIndices = ref<number[]>([]);
watch(isOpened, opened => {
  if (!opened) {
    selectedIndices.value = [];
  }
});
</script>

<template>
  <UiModal
    v-model:is-opened="isOpened"
    title="Destiny Phase"
    description="You may choose to play one Destiny card"
    :closable="false"
    :style="{
      '--ui-modal-size': 'var(--size-lg)'
    }"
  >
    <div class="content" :class="{ 'is-showing-board': isShowingBoard }">
      <p v-if="playedCard" class="text-5 mb-4">
        Select the card to put in the Destiny Zone ({{
          selectedIndices.length
        }}
        / {{ playedCard.manaCost }}) .
      </p>
      <div class="card-list">
        <label v-for="card in displayedCards" :key="card.cardId">
          <GameCard
            :key="card.cardId"
            :card-id="card.cardId"
            :interactive="false"
          />
          <input
            type="checkbox"
            class="hidden"
            :value="card.indexInHand"
            v-model="selectedIndices"
            :disabled="
              selectedIndices.length >= (playedCard?.manaCost ?? 0) &&
              !selectedIndices.includes(card.indexInHand)
            "
          />
        </label>
      </div>
      <footer class="flex mt-7 gap-10 justify-center">
        <FancyButton
          :text="isShowingBoard ? 'Hide Board' : 'Show Board'"
          @click="isShowingBoard = !isShowingBoard"
        />
        <FancyButton
          text="Cancel"
          variant="error"
          @click="
            client.adapter.dispatch({
              type: 'cancelPlayCard',
              payload: { playerId: state.turnPlayer }
            })
          "
        />
        <FancyButton
          variant="info"
          text="Play card"
          :disabled="selectedIndices.length < (playedCard?.manaCost ?? 0)"
          @click="
            client.adapter.dispatch({
              type: 'commitPlayCard',
              payload: {
                playerId: client.playerId,
                manaCostIndices: selectedIndices
              }
            })
          "
        />
      </footer>
    </div>
  </UiModal>
  <GameCard
    v-if="playedCardId"
    :card-id="playedCardId"
    :interactive="false"
    :auto-scale="false"
    class="played-card"
  />
</template>

<style scoped lang="postcss">
.content {
  &.is-showing-board .card-list {
    visibility: hidden;
  }
}

.card-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--size-2);
  > * {
    width: var(--card-width);
    height: var(--card-height);
    transition: all 0.2s var(--ease-2);
  }

  > label:has(input:checked) {
    filter: brightness(1.3);
    transform: translateY(10px);
  }

  > label:has(input:disabled) {
    filter: grayscale(0.75);
  }
}

:global(
    body:has(.modal-overlay + .modal-content .is-showing-board) .modal-overlay
  ) {
  opacity: 0;
}

h2 {
  text-align: center;
  margin-bottom: var(--size-7);
  font-weight: var(--font-weight-4);
}

.played-card {
  position: fixed;
  top: var(--size-8);
  right: var(--size-8);
  z-index: 10;
}
</style>
