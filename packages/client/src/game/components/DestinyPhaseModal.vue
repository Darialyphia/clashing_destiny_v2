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
import { INTERACTION_STATES } from '@game/engine/src/game/systems/game-interaction.system';
import type { CardViewModel } from '@game/engine/src/client/view-models/card.model';
import { GAME_PHASES } from '@game/engine/src/game/game.enums';
import { FX_EVENTS } from '@game/engine/src/client/controllers/fx-controller';

const board = useMyBoard();
const isShowingBoard = ref(false);
const state = useGameState();
const client = useGameClient();

const isOpened = ref(false);
watchEffect(() => {
  isOpened.value =
    client.value.playerId === state.value.turnPlayer &&
    state.value.phase.state === GAME_PHASES.DESTINY &&
    state.value.interaction.state === INTERACTION_STATES.IDLE;
});
useFxEvent(FX_EVENTS.PLAYER_PAY_FOR_DESTINY_COST, async () => {
  isOpened.value = false;
});

const selectedIndex = ref<number | null>(null);
const selected = computed({
  get() {
    return selectedIndex.value;
  },
  set(value: number) {
    if (value === selectedIndex.value) {
      selectedIndex.value = null;
    } else {
      selectedIndex.value = value;
    }
  }
});
watch(isOpened, opened => {
  if (!opened) {
    selectedIndex.value = null;
  }
});

const destinyCards = computed<CardViewModel[]>(() => {
  return board.value.destinyDeck.cards.map(cardId => {
    return state.value.entities[cardId] as CardViewModel;
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
          v-for="(card, index) in destinyCards"
          :key="card.id"
          :class="{ selected: selected === index }"
          :disabled="!card.canPlay"
          @click="selected = index"
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
          variant="info"
          :text="selectedIndex !== null ? 'Play' : 'Skip'"
          @click="
            isOpened = false;
            client.networkAdapter.dispatch({
              type: 'playDestinyCard',
              payload: {
                playerId: state.turnPlayer,
                index: selectedIndex
              }
            });
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
