<script setup lang="ts">
import UiModal from '@/ui/components/UiModal.vue';
import FancyButton from '@/ui/components/FancyButton.vue';
import { useBoardSide } from '../composables/useGameClient';
import GameCard from './GameCard.vue';

const { player } = defineProps<{
  player: string;
}>();
const isOpened = defineModel<boolean>('isOpened', { required: true });

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
      <div class="card-list fancy-scrollbar">
        <div v-for="card in board.banishPile" :key="card">
          <GameCard :card-id="card" />
        </div>
      </div>
      <footer class="flex mt-7 gap-10 justify-center">
        <FancyButton text="Close" @click="isOpened = false" />
      </footer>
    </div>
  </UiModal>
</template>

<style scoped lang="postcss">
.content {
  height: 80dvh;
  display: grid;
  grid-template-rows: 1fr auto;
  overflow: hidden;
  &.is-showing-board .card-list {
    visibility: hidden;
  }
}

.card-list {
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  row-gap: var(--size-3);
  justify-items: center;
  grid-auto-rows: min-content;
  > * {
    width: var(--card-width);
    height: var(--card-height);
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
