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
import CardResizer from './CardResizer.vue';

const board = useMyBoard();
const isShowingBoard = ref(false);
const state = useGameState();
const client = useGameClient();

const isOpened = ref(
  client.value.playerId === state.value.currentPlayer &&
    state.value.phase.state === GAME_PHASES.DESTINY
);

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

const hoveredCard = ref<CardViewModel | null>(null);
</script>

<template>
  <UiModal
    v-if="client.ui.displayedElements.destinyPhaseModal"
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

      <div class="content-inner">
        <div class="card-list">
          <button
            v-for="card in destinyCards"
            :key="card.id"
            class="toggle"
            :class="{ selected: selected === card.id }"
            :disabled="!card.canPlay"
            @mouseenter="hoveredCard = card"
            @mouseleave="hoveredCard = null"
            @click="selected = card.id"
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
  &.is-showing-board .content-inner {
    visibility: hidden;
  }
}

.content-inner {
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
  &.selected .destiny-card {
    filter: brightness(1.3);
    outline: solid var(--border-size-3) var(--primary);
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
