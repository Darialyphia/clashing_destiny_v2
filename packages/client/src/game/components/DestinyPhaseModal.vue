<script setup lang="ts">
import UiModal from '@/ui/components/UiModal.vue';
import FancyButton from '@/ui/components/FancyButton.vue';
import {
  useFxEvent,
  useGameClient,
  useGameState,
  useMyBoard
} from '../composables/useGameClient';
import GameCard from './GameCard.vue';
import type { CardViewModel } from '@game/engine/src/client/view-models/card.model';
import { GAME_PHASES } from '@game/engine/src/game/game.enums';
import { FX_EVENTS } from '@game/engine/src/client/controllers/fx-controller';

const board = useMyBoard();
const isShowingBoard = ref(false);
const state = useGameState();
const client = useGameClient();

const isOpened = ref(client.value.playerId === state.value.currentPlayer);
useFxEvent(FX_EVENTS.AFTER_CHANGE_PHASE, async event => {
  if (
    client.value.playerId === state.value.currentPlayer &&
    event.to.state === GAME_PHASES.DESTINY
  ) {
    isOpened.value = true;
  }
});

const selectedId = ref<string | null>(null);
const selected = computed({
  get() {
    return selectedId.value;
  },
  set(value: string) {
    if (value === selectedId.value) {
      selectedId.value = null;
    } else {
      selectedId.value = value;
    }
  }
});
watch(isOpened, opened => {
  if (!opened) {
    selectedId.value = null;
  }
});

const destinyCards = computed<CardViewModel[]>(() => {
  return board.value.destinyDeck
    .map(cardId => {
      return state.value.entities[cardId] as CardViewModel;
    })
    .sort((a, b) => {
      return a.destinyCost! - b.destinyCost! || a.name.localeCompare(b.name);
    });
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
      <p class="text-5 mb-4">Play up to one Destiny Card.</p>

      <div class="card-list">
        <button
          v-for="card in destinyCards"
          :key="card.id"
          :class="{ selected: selected === card.id }"
          :disabled="!card.canPlay"
          @click="selected = card.id"
        >
          <GameCard :key="card.id" :card-id="card.id" :interactive="false" />
        </button>
      </div>
      <footer class="flex mt-7 gap-10 justify-center">
        <FancyButton
          :text="isShowingBoard ? 'Hide Board' : 'Show Board'"
          @click="isShowingBoard = !isShowingBoard"
        />

        <FancyButton
          :variant="selectedId !== null ? 'info' : 'error'"
          :text="selectedId !== null ? 'Play' : 'Skip'"
          @click="
            () => {
              isOpened = false;
              if (selectedId === null) {
                return client.skipDestiny();
              }

              client.networkAdapter.dispatch({
                type: 'playDestinyCard',
                payload: {
                  playerId: state.currentPlayer,
                  id: selectedId!
                }
              });
            }
          "
        />
      </footer>
    </div>
  </UiModal>
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

  > button.selected {
    filter: brightness(1.3);
    transform: translateY(10px);
  }

  > button:disabled {
    filter: grayscale(0.7);
    pointer-events: none;
  }
}

:global(
    body:has(.modal-overlay + .modal-content .is-showing-board) .modal-overlay
  ) {
  opacity: 0;
}
</style>
