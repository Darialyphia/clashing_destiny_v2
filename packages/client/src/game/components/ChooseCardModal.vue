<script setup lang="ts">
import UiModal from '@/ui/components/UiModal.vue';
import FancyButton from '@/ui/components/FancyButton.vue';
import { useGameClient, useGameState } from '../composables/useGameClient';
import GameCard from './GameCard.vue';
import { INTERACTION_STATES } from '@game/engine/src/game/systems/game-interaction.system';

const { client, playerId } = useGameClient();
const isOpened = ref(false);
const state = useGameState();

watchEffect(() => {
  isOpened.value =
    state.value.interaction.state === INTERACTION_STATES.CHOOSING_CARDS &&
    playerId.value === client.value.getActivePlayerId();
});
const isShowingBoard = ref(false);

const displayedCards = computed(() => {
  if (state.value.interaction.state !== INTERACTION_STATES.CHOOSING_CARDS)
    return [];

  return state.value.interaction.ctx.choices;
});

const selectedIndices = ref<number[]>([]);
watch(isOpened, () => {
  selectedIndices.value = [];
});

const label = computed(() => {
  if (state.value.interaction.state !== INTERACTION_STATES.CHOOSING_CARDS)
    return '';
  return state.value.interaction.ctx.label;
});

const minChoices = computed(() => {
  if (state.value.interaction.state !== INTERACTION_STATES.CHOOSING_CARDS)
    return 0;
  return state.value.interaction.ctx.minChoiceCount;
});

const maxChoices = computed(() => {
  if (state.value.interaction.state !== INTERACTION_STATES.CHOOSING_CARDS)
    return 0;
  return state.value.interaction.ctx.maxChoiceCount;
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
      <p class="text-5 mb-4">
        {{ label }} ({{ selectedIndices.length }}/{{ maxChoices }})
      </p>
      <div class="card-list fancy-scrollbar">
        <label v-for="(card, index) in displayedCards" :key="card">
          <GameCard :key="card" :card-id="card" :interactive="false" />
          <input
            type="checkbox"
            class="hidden"
            :value="index"
            v-model="selectedIndices"
            :disabled="
              selectedIndices.length >= maxChoices &&
              !selectedIndices.includes(index)
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
          variant="info"
          text="Confirm"
          :disabled="selectedIndices.length < minChoices"
          @click="
            isOpened = false;
            client.chooseCards(selectedIndices);
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
  --pixel-scale: 2;
  display: grid;
  grid-template-columns: repeat(
    auto-fit,
    minmax(calc(var(--pixel-scale) * var(--card-width)), 1fr)
  );
  justify-items: center;
  row-gap: var(--size-4);
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

:global(
  body:has(.modal-overlay + .modal-content .is-showing-board) .modal-overlay
) {
  opacity: 0;
}
</style>
