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
        {{ label }}
      </p>
      <div class="question-source">
        <GameCard v-if="source" :card-id="source" :is-interactive="false" />
      </div>
      <ul class="flex gap-4 justify-center">
        <li v-for="choice in choices" :key="choice.id">
          <FancyButton
            v-if="!isShowingBoard"
            variant="info"
            :text="choice.label"
            @click="
              _isOpened = false;
              client.answerQuestion(choice.id);
            "
          />
        </li>
      </ul>
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

.question-source {
  display: flex;
  justify-content: center;
  margin-bottom: var(--size-5);
  --pixel-scale: 1.5;
}
</style>
