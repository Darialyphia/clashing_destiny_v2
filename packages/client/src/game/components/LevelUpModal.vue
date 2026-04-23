<script setup lang="ts">
import UiModal from '@/ui/components/UiModal.vue';
import {
  useGameClient,
  useGameState,
  useMyPlayer
} from '../composables/useGameClient';
import { GAME_PHASES } from '@game/engine/src/game/game.enums';
import type { SerializedLevelUpPhase } from '@game/engine/src/game/phases/level-up.phase';
import GameCard from './GameCard.vue';
import FancyButton from '@/ui/components/FancyButton.vue';

const state = useGameState();
const { client } = useGameClient();
const isShowingBoard = ref(false);

const isOpened = computed({
  get() {
    if (isShowingBoard.value) return false;
    if (state.value.phase.state !== GAME_PHASES.LEVEL_UP) return false;

    const ctx = state.value.phase.ctx as SerializedLevelUpPhase;
    const selections = Object.values(ctx.selections);

    return selections.some(s => s === null);
  },
  set() {
    // Modal cannot be closed manually during level up phase
  }
});

const player = useMyPlayer();

const selectedCardId = ref(null as string | null);

const hasConfirmed = computed(() => {
  if (state.value.phase.state !== GAME_PHASES.LEVEL_UP) return false;
  const ctx = state.value.phase.ctx as SerializedLevelUpPhase;
  return ctx.selections[player.value.id] !== null;
});

const commit = () => {
  if (hasConfirmed.value) return;

  client.value.selectLevelUpCard(selectedCardId.value);
  selectedCardId.value = null;
};
</script>

<template>
  <UiModal
    v-model:is-opened="isOpened"
    title="Level Up Phase"
    description="Select a destiny card to play or skip"
    :closable="false"
    :style="{
      '--ui-modal-size': 'var(--size-xl)'
    }"
  >
    <div class="content">
      <p class="text-5 mb-4 text-center" v-if="!isShowingBoard">
        Select a destiny card to play or skip
      </p>
      <p v-if="hasConfirmed">Waiting for opponent to choose...</p>
      <div class="card-list fancy-scrollbar">
        <GameCard
          v-for="card in player.destinyDeck"
          :key="card.id"
          :card-id="card.id"
          :interactive="false"
          :class="{
            disabled: !card.canPlay || hasConfirmed,
            selected: selectedCardId === card.id
          }"
          @click="
            () => {
              if (selectedCardId === card.id) {
                selectedCardId = null;
              } else {
                selectedCardId = card.id;
              }
            }
          "
        />
      </div>
      <footer class="flex mt-7 gap-10 justify-center">
        <FancyButton
          v-if="!isShowingBoard"
          variant="info"
          :text="selectedCardId ? 'Play Card' : 'Skip'"
          @click="commit"
        />
      </footer>
    </div>
  </UiModal>
  <Teleport to="body">
    <FancyButton
      v-if="isOpened || isShowingBoard"
      class="board-toggle"
      :text="isShowingBoard ? 'Hide Board' : 'Show Board'"
      @click="isShowingBoard = !isShowingBoard"
    />
  </Teleport>
</template>

<style scoped lang="postcss">
.board-toggle {
  position: fixed;
  bottom: var(--size-8);
  right: var(--size-8);
  z-index: 50;
  pointer-events: auto;
}
.card-list {
  --pixel-scale: 1.5;
  display: grid;
  grid-template-columns: repeat(
    auto-fit,
    minmax(calc(var(--pixel-scale) * var(--card-width)), 1fr)
  );
  justify-items: center;
  row-gap: var(--size-4);
  max-height: 80dvh;
  overflow-y: auto;
  > * {
    transition: all 0.2s var(--ease-2);
  }

  .selected {
    filter: brightness(1.3);
    position: relative;
    &::after {
      content: '';
      position: absolute;
      inset: 0;
      background-color: hsl(200 100% 50% / 0.25);
      pointer-events: none;
    }
  }

  .disabled {
    filter: grayscale(0.75);
  }
}
</style>
