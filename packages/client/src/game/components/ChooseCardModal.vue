<script setup lang="ts">
import UiModal from '@/ui/components/UiModal.vue';
import FancyButton from '@/ui/components/FancyButton.vue';
import {
  useFxEvent,
  useGameClient,
  useGameState
} from '../composables/useGameClient';
import GameCard from './GameCard.vue';
import { INTERACTION_STATES } from '@game/engine/src/game/game.enums';
import { FX_EVENTS } from '@game/engine/src/client/controllers/fx-controller';
import { isDefined } from '@game/shared';

const { client, playerId } = useGameClient();
const _isOpened = ref(false);
const state = useGameState();

const isOpened = computed({
  get() {
    return _isOpened.value && !isShowingBoard.value;
  },
  set(value: boolean) {
    _isOpened.value = value;
  }
});

useFxEvent(FX_EVENTS.INTERACTION_AFTER_CHANGE_STATE, event => {
  const { to } = event;
  if (to.state !== INTERACTION_STATES.CHOOSING_CARDS) {
    _isOpened.value = false;
    return;
  }

  if (to.ctx.initialPlayers?.includes(playerId.value)) {
    _isOpened.value = true;
  }
});

const isShowingBoard = ref(false);

const displayedCards = computed(() => {
  if (state.value.interaction.state !== INTERACTION_STATES.CHOOSING_CARDS)
    return [];

  return (
    state.value.interaction.ctx.playerConfig[playerId.value]?.choices ?? []
  );
});

const selectedIndices = ref<number[]>([]);
watch(_isOpened, () => {
  selectedIndices.value = [];
});

const ctx = computed(() => {
  if (state.value.interaction.state !== INTERACTION_STATES.CHOOSING_CARDS)
    return null;
  return state.value.interaction.ctx;
});
const label = computed(() => {
  if (!ctx.value) return '';
  return ctx.value.playerConfig[playerId.value]?.label ?? '';
});

const minChoices = computed(() => {
  if (!ctx.value) return 0;
  return ctx.value.playerConfig[playerId.value]?.minChoiceCount ?? 0;
});

const maxChoices = computed(() => {
  if (!ctx.value) return 0;
  return ctx.value.playerConfig[playerId.value]?.maxChoiceCount ?? 0;
});

const isWaiting = computed(() => {
  if (!ctx.value) {
    return false;
  }
  if (!ctx.value.initialPlayers.includes(playerId.value)) {
    return false;
  }
  return (
    !ctx.value.players.includes(playerId.value) ||
    isDefined(
      client.value.optimisticStateManager.state.chooseCardSelection[
        playerId.value
      ]
    )
  );
});
const confirm = () => {
  client.value.chooseCards(selectedIndices.value);
  selectedIndices.value = [];
  // If only one player needed to choose cards, close immediately
  if (ctx.value?.initialPlayers.length === 1) {
    _isOpened.value = false;
  }
};
</script>

<template>
  <UiModal
    v-model:is-opened="isOpened"
    :title="label"
    :description="`Select up to ${maxChoices} cards`"
    :closable="false"
    :style="{
      '--ui-modal-size': 'var(--size-xl)'
    }"
  >
    <div class="content">
      <p
        class="title text-center dual-text"
        v-if="!isShowingBoard"
        :data-text="`${label} (${selectedIndices.length}/${maxChoices})`"
        style="--dual-text-stroke-offset-y: -5px"
      >
        {{ label }} ({{ selectedIndices.length }}/{{ maxChoices }})
      </p>
      <div class="card-list fancy-scrollbar">
        <label v-for="(card, index) in displayedCards" :key="card">
          <GameCard
            :key="card"
            :card-id="card"
            :interactive="false"
            :pixel-scale="2"
          />
          <input
            type="checkbox"
            class="hidden"
            :value="index"
            v-model="selectedIndices"
            :disabled="
              isWaiting ||
              (selectedIndices.length >= maxChoices &&
                !selectedIndices.includes(index))
            "
          />
        </label>
      </div>
      <footer class="flex mt-7 gap-10 justify-center">
        <FancyButton
          v-if="!isShowingBoard && !isWaiting"
          variant="info"
          text="Confirm"
          :disabled="selectedIndices.length < minChoices || isWaiting"
          @click="confirm"
        />
        <p
          v-if="isWaiting"
          class="waiting dual-text"
          data-text="Waiting for Opponent to make their choice..."
          style="--dual-text-stroke-offset-y: -5px"
        >
          Waiting for Opponent to make their choice...
        </p>
      </footer>
    </div>
  </UiModal>
  <Teleport to="body">
    <FancyButton
      v-if="_isOpened || isShowingBoard"
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
  --pixel-scale: 2;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--size-4) var(--size-5);
  max-height: 60dvh;
  overflow-y: auto;
  > * {
    transition: all 0.2s var(--ease-2);
  }

  > label:has(input:checked) {
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

  > label:has(input:disabled) {
    filter: grayscale(0.75);
  }
}

.title {
  font-size: var(--font-size-6);
  font-weight: var(--font-weight-7);
  margin-bottom: var(--size-4);
  color: transparent;
  text-align: center;
}
.waiting {
  text-align: center;
  font-size: var(--font-size-5);
  font-weight: var(--font-weight-7);
  color: transparent;
}
</style>
