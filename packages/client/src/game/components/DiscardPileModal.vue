<script setup lang="ts">
import UiModal from '@/ui/components/UiModal.vue';
import FancyButton from '@/ui/components/FancyButton.vue';
import { usePlayer } from '../composables/useGameClient';
import GameCard from './GameCard.vue';

const { playerId } = defineProps<{
  playerId: string;
}>();

const isOpened = ref(false);

const close = () => {
  isOpened.value = false;
};

const player = usePlayer(playerId);
</script>

<template>
  <UiModal
    v-model:is-opened="isOpened"
    :title="
      player.id === playerId ? 'Your Discard Pile' : 'Opponent Discard Pile'
    "
    description=""
    :style="{
      '--ui-modal-size': 'var(--size-lg)'
    }"
  >
    <div class="content" @click="close">
      <header>
        <h2 class="text-center">
          {{
            player.id === playerId
              ? 'Your Discard Pile'
              : 'Opponent Discard Pile'
          }}
        </h2>
      </header>
      <div class="card-list fancy-scrollbar">
        <div
          v-for="card in player.discardPile.toReversed()"
          :key="card"
          @click.stop
        >
          <GameCard :card-id="card" :actions-offset="10" />
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
  --pixel-scale: 1.5;
  @screen lt-lg {
    --pixel-scale: 1;
  }
  height: 80dvh;
  display: grid;
  grid-template-rows: auto 1fr auto;
  overflow: hidden;
  &.is-showing-board .card-list {
    visibility: hidden;
  }
}

.card-list {
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  row-gap: var(--size-3);
  justify-items: center;
  grid-auto-rows: min-content;
}

h2 {
  text-align: center;
  margin-bottom: var(--size-7);
  font-weight: var(--font-weight-4);
}
</style>
