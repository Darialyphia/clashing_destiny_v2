<script setup lang="ts">
import UiModal from '@/ui/components/UiModal.vue';
import FancyButton from '@/ui/components/FancyButton.vue';
import { useGameClient, useGameState } from '../composables/useGameClient';
import GameCard from './GameCard.vue';
import { INTERACTION_STATES } from '@game/engine/src/game/systems/game-interaction.system';

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
watchEffect(() => {
  _isOpened.value =
    state.value.interaction.state === INTERACTION_STATES.ASK_QUESTION &&
    playerId.value === client.value.getActivePlayerId();
});
const isShowingBoard = ref(false);

const selectedIndices = ref<number[]>([]);
watch(_isOpened, () => {
  selectedIndices.value = [];
});

const label = computed(() => {
  if (state.value.interaction.state !== INTERACTION_STATES.ASK_QUESTION)
    return '';
  return state.value.interaction.ctx.label;
});

const source = computed(() => {
  if (state.value.interaction.state !== INTERACTION_STATES.ASK_QUESTION)
    return null;
  return state.value.interaction.ctx.source;
});

const choices = computed(() => {
  if (state.value.interaction.state !== INTERACTION_STATES.ASK_QUESTION)
    return [];
  return state.value.interaction.ctx.choices;
});

const minChoices = computed(() => {
  if (state.value.interaction.state !== INTERACTION_STATES.ASK_QUESTION)
    return 0;
  return state.value.interaction.ctx.minChoiceCount;
});

const maxChoices = computed(() => {
  if (state.value.interaction.state !== INTERACTION_STATES.ASK_QUESTION)
    return 0;
  return state.value.interaction.ctx.maxChoiceCount;
});
</script>

<template>
  <UiModal
    v-model:is-opened="isOpened"
    title="''"
    description="Answer the question"
    :closable="false"
    :style="{
      '--ui-modal-size': 'var(--size-lg)'
    }"
  >
    <div class="content">
      <p class="text-5 mb-4" v-if="!isShowingBoard">
        {{ label }} ({{ selectedIndices.length }}/{{ maxChoices }})
      </p>
      <div class="flex justify-center mb-5">
        <GameCard v-if="source" :card-id="source" :is-interactive="false" />
      </div>
      <ul class="flex gap-4 justify-center">
        <li v-for="(choice, index) in choices" :key="choice.id">
          <label class="block cursor-pointer text-4">
            <input
              type="checkbox"
              :id="`choice-${index}`"
              :value="index"
              v-model="selectedIndices"
              :disabled="
                (selectedIndices.length >= maxChoices &&
                  !selectedIndices.includes(index)) ||
                false
              "
            />
            {{ choice.label }}
          </label>
        </li>
      </ul>
      <footer class="flex mt-7 gap-10 justify-center">
        <FancyButton
          v-if="!isShowingBoard"
          variant="info"
          text="Confirm"
          :disabled="selectedIndices.length < minChoices"
          @click="
            _isOpened = false;
            client.answerQuestion(selectedIndices);
          "
        />
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
</style>
