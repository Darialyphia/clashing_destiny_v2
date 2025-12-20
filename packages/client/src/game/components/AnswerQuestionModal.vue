<script setup lang="ts">
import UiModal from '@/ui/components/UiModal.vue';
import FancyButton from '@/ui/components/FancyButton.vue';
import {
  useGameClient,
  useGameState,
  useGameUi
} from '../composables/useGameClient';
import GameCard from './GameCard.vue';
import { INTERACTION_STATES } from '@game/engine/src/game/systems/game-interaction.system';
import { GAME_QUESTIONS } from '@game/engine/src/game/game.enums';

const { client, playerId } = useGameClient();
const _isOpened = ref(false);
const state = useGameState();
const ui = useGameUi();

const isOpened = computed({
  get() {
    return _isOpened.value && !isShowingBoard.value;
  },
  set(value: boolean) {
    _isOpened.value = value;
  }
});

const currentQuestion = ref<string | null>(null);

watchEffect(() => {
  const interactionState = state.value.interaction.state;
  if (interactionState !== INTERACTION_STATES.ASK_QUESTION) {
    _isOpened.value = false;
    currentQuestion.value = null;
    return;
  }

  if (currentQuestion.value === state.value.interaction.ctx.questionId) {
    return;
  }

  currentQuestion.value = state.value.interaction.ctx.questionId;

  if (
    currentQuestion.value === GAME_QUESTIONS.SUMMON_POSITION &&
    ui.value.bufferedPlayedZone
  ) {
    client.value.answerQuestion(ui.value.bufferedPlayedZone);
    ui.value.clearBufferedPlayedZone();
    return;
  }

  _isOpened.value =
    state.value.interaction.ctx.player === playerId.value &&
    playerId.value === client.value.getActivePlayerId();
});
const isShowingBoard = ref(false);

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
