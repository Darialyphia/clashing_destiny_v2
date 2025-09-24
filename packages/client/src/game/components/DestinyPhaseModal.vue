<script setup lang="ts">
import UiModal from '@/ui/components/UiModal.vue';
import FancyButton from '@/ui/components/FancyButton.vue';
import {
  useGameClient,
  useGameState,
  useMyBoard
} from '../composables/useGameClient';
import GameCard from './GameCard.vue';
import type { CardViewModel } from '@game/engine/src/client/view-models/card.model';

import CardResizer from './CardResizer.vue';

const board = useMyBoard();
const isShowingBoard = ref(false);
const state = useGameState();
const client = useGameClient();

const isOpened = defineModel<boolean>('isOpened', { required: true });

const destinyCards = computed<CardViewModel[]>(() => {
  return board.value.destinyDeck
    .map(cardId => {
      return state.value.entities[cardId] as CardViewModel;
    })
    .sort((a, b) => {
      return a.destinyCost! - b.destinyCost! || a.name.localeCompare(b.name);
    });
});

const hoveredCard = ref<CardViewModel | null>(null);
</script>

<template>
  <UiModal
    v-if="client.ui.displayedElements.destinyPhaseModal && !isShowingBoard"
    v-model:is-opened="isOpened"
    title="Destiny Phase"
    description="You may choose to play one Destiny card"
    :closable="false"
    :style="{
      '--ui-modal-size': 'var(--size-lg)'
    }"
  >
    <p class="text-5 mb-4">Play up to one Destiny Card.</p>

    <section>
      <div class="card-list">
        <button
          v-for="card in destinyCards"
          :key="card.id"
          class="toggle"
          :disabled="!card.canPlay"
          @mouseenter="hoveredCard = card"
          @mouseleave="hoveredCard = null"
          @click="
            isOpened = false;
            client.networkAdapter.dispatch({
              type: 'declarePlayCard',
              payload: {
                playerId: state.currentPlayer,
                id: card.id
              }
            });
          "
        >
          <CardResizer :forced-scale="0.5">
            <GameCard
              class="destiny-card"
              :key="card.id"
              :card-id="card.id"
              :interactive="false"
              :auto-scale="false"
            />
          </CardResizer>
        </button>
      </div>

      <div class="hovered-card">
        <GameCard
          v-if="hoveredCard"
          :card-id="hoveredCard.id"
          :interactive="false"
          :auto-scale="true"
        />
      </div>
    </section>
  </UiModal>

  <FancyButton
    v-if="isOpened"
    class="board-toggle"
    :text="isShowingBoard ? 'Hide Board' : 'Show Board'"
    @click="isShowingBoard = !isShowingBoard"
  />
</template>

<style scoped lang="postcss">
.board-toggle {
  position: fixed;
  bottom: var(--size-8);
  right: var(--size-8);
  z-index: 999;
  pointer-events: auto;
}

section {
  display: grid;
  grid-template-columns: 4fr 2fr;
  gap: var(--size-2);
}

.card-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--size-2);
}

.hovered-card {
  --pixel-scale: 2;
}
:deep(.inspectable-card) {
  width: var(--card-width);
  height: var(--card-height);
}

.toggle {
  width: var(--card-width);
  height: var(--card-height);
  transition: all 0.2s var(--ease-2);
  &:hover .destiny-card {
    filter: brightness(1.3);
    outline: solid var(--border-size-2) var(--primary);
  }

  &:disabled {
    filter: grayscale(0.7);
  }
}

:global(
  body:has(.modal-overlay + .modal-content .is-showing-board) .modal-overlay
) {
  opacity: 0;
}
</style>
