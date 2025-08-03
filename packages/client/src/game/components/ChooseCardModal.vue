<script setup lang="ts">
import UiModal from '@/ui/components/UiModal.vue';
import FancyButton from '@/ui/components/FancyButton.vue';
import { useGameClient, useGameState } from '../composables/useGameClient';
import GameCard from './GameCard.vue';
import { INTERACTION_STATES } from '@game/engine/src/game/systems/game-interaction.system';

const client = useGameClient();
const isOpened = computed(() => {
  return client.value.ui.isChooseCardsInteractionOverlayOpened;
});

const isShowingBoard = ref(false);
const state = useGameState();

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
          text="Play card"
          :disabled="selectedIndices.length < minChoices"
          @click="client.chooseCards(selectedIndices)"
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
  max-height: 60dvh;
  overflow-y: auto;
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
</style>
