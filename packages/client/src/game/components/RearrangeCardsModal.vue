<script setup lang="ts">
import UiModal from '@/ui/components/UiModal.vue';
import FancyButton from '@/ui/components/FancyButton.vue';
import { useGameClient, useGameState } from '../composables/useGameClient';
import GameCard from './GameCard.vue';
import { INTERACTION_STATES } from '@game/engine/src/game/game.enums';

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
    state.value.interaction.state === INTERACTION_STATES.REARRANGING_CARDS &&
    playerId.value === client.value.getActivePlayerId();
});
const isShowingBoard = ref(false);

const result = ref<Array<{ id: string; cards: string[]; label: string }>>([]);

const interactionState = computed(() => {
  if (state.value.interaction.state !== INTERACTION_STATES.REARRANGING_CARDS)
    return null;
  return state.value.interaction.ctx;
});

watch(interactionState, state => {
  if (!state) return;
  result.value = state.buckets.map(bucket => ({
    label: bucket.label,
    id: bucket.id,
    cards: [...bucket.cards]
  }));
  result.value = [];
});

watch(_isOpened, () => {
  result.value = [];
});

const label = computed(() => {
  if (state.value.interaction.state !== INTERACTION_STATES.REARRANGING_CARDS)
    return '';
  return state.value.interaction.ctx.label;
});
</script>

<template>
  <UiModal
    v-model:is-opened="isOpened"
    title="Destiny Phase"
    description="Rearrange your cards"
    :closable="false"
    :style="{
      '--ui-modal-size': 'var(--size-lg)'
    }"
  >
    <div class="content">
      <p class="text-5 mb-4" v-if="!isShowingBoard">
        {{ label }}
      </p>
      <div class="buckets fancy-scrollbar">
        <!-- implement card rearrangement UI here-->
      </div>
      <footer class="flex mt-7 gap-10 justify-center">
        <FancyButton
          v-if="!isShowingBoard"
          variant="info"
          text="Confirm"
          @click="
            _isOpened = false;
            client.commitRearrangeCards(result);
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

.buckets {
  --pixel-scale: 1;
}
</style>
