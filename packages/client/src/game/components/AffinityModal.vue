<script setup lang="ts">
import UiModal from '@/ui/components/UiModal.vue';
import FancyButton from '@/ui/components/FancyButton.vue';
import {
  useGameClient,
  useGameState,
  useMyBoard
} from '../composables/useGameClient';
import { INTERACTION_STATES } from '@game/engine/src/game/systems/game-interaction.system';
import type { CardViewModel } from '@game/engine/src/client/view-models/card.model';
import type { Affinity } from '@game/engine/src/card/card.enums';

const board = useMyBoard();
const isShowingBoard = ref(false);
const state = useGameState();
const client = useGameClient();

const isOpened = computed(() => {
  return (
    state.value.interaction.state === INTERACTION_STATES.CHOOSING_AFFINITY &&
    state.value.interaction.ctx.player === client.value.playerId
  );
});

const selected = ref<Affinity | null>(null);

watch(isOpened, opened => {
  if (!opened) {
    selected.value = null;
  }
});

const affinities = computed<Affinity[]>(() => {
  if (state.value.interaction.state !== INTERACTION_STATES.CHOOSING_AFFINITY) {
    return [];
  }
  return state.value.interaction.ctx.choices;
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
      <p class="text-5 mb-4">Choose which Affinity to unlock.</p>

      <div class="flex gap-3">
        <label
          v-for="affinity in affinities"
          :key="affinity"
          :style="{
            '--bg': `url('/assets/ui/affinity-${affinity.toLowerCase()}.png')`
          }"
        >
          <input
            type="radio"
            class="hidden"
            :value="affinity"
            v-model="selected"
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
          text="Choose"
          :disabled="selected === null"
          @click="
            client.adapter.dispatch({
              type: 'chooseAffinity',
              payload: {
                playerId: state.turnPlayer,
                affinity: selected!
              }
            })
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

label {
  width: 64px;
  height: 64px;
  background: var(--bg);
  background-size: cover;
  background-position: center;
  cursor: pointer;
  border-radius: var(--border-radius-2);
  transition: transform 0.2s var(--ease-2);
  &:has(input:checked) {
    transform: scale(1.25);
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
</style>
