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

const label = computed(() => {
  if (state.value.interaction.state !== INTERACTION_STATES.CHOOSING_CARDS)
    return '';
  return state.value.interaction.ctx.playerConfig[playerId.value]?.label ?? '';
});

const minChoices = computed(() => {
  if (state.value.interaction.state !== INTERACTION_STATES.CHOOSING_CARDS)
    return 0;
  return (
    state.value.interaction.ctx.playerConfig[playerId.value]?.minChoiceCount ??
    0
  );
});

const maxChoices = computed(() => {
  if (state.value.interaction.state !== INTERACTION_STATES.CHOOSING_CARDS)
    return 0;
  return (
    state.value.interaction.ctx.playerConfig[playerId.value]?.maxChoiceCount ??
    0
  );
});

const isWaiting = computed(() => {
  return (
    state.value.interaction.state === INTERACTION_STATES.CHOOSING_CARDS &&
    state.value.interaction.ctx.initialPlayers?.includes(playerId.value) &&
    !state.value.interaction.ctx.players.includes(playerId.value)
  );
});
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
      <p class="text-5 mb-4" v-if="!isShowingBoard">
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
          @click="
            () => {
              client.chooseCards(selectedIndices);
              selectedIndices = [];
            }
          "
        />
        <p v-if="isWaiting">
          Waiting for other players to make their choices...
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
</style>
