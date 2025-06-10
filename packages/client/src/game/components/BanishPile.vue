<script setup lang="ts">
import UiModal from '@/ui/components/UiModal.vue';
import FancyButton from '@/ui/components/FancyButton.vue';
import {
  useBoardSide,
  useGameClient,
  useGameState,
  useMyBoard
} from '../composables/useGameClient';
import GameCard from './GameCard.vue';
import { INTERACTION_STATES } from '@game/engine/src/game/systems/game-interaction.system';
import type { CardViewModel } from '@game/engine/src/client/view-models/card.model';
import InspectableCard from '@/card/components/InspectableCard.vue';

const { player } = defineProps<{
  player: string;
}>();
const isOpened = defineModel<boolean>('isOpened', { required: true });

const state = useGameState();
const client = useGameClient();

const board = useBoardSide(computed(() => player));
</script>

<template>
  <UiModal
    v-model:is-opened="isOpened"
    title="Discard Pile"
    description=""
    :style="{
      '--ui-modal-size': 'var(--size-lg)'
    }"
  >
    <div class="content">
      <div class="card-list">
        <GameCard
          v-for="card in board.banishPile"
          :key="card"
          :card-id="card"
          :interactive="false"
        />
      </div>
      <footer class="flex mt-7 gap-10 justify-center">
        <FancyButton text="Close" @click="isOpened = false" />
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
  > * {
    width: var(--card-width);
    height: var(--card-height);
    transition: all 0.2s var(--ease-2);
  }
}

h2 {
  text-align: center;
  margin-bottom: var(--size-7);
  font-weight: var(--font-weight-4);
}

.played-card {
  position: fixed;
  top: var(--size-8);
  right: var(--size-8);
  z-index: 10;
}
</style>
