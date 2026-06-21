<script setup lang="ts">
import GameCard from './GameCard.vue';
import { useGameState, useGameUi } from '../composables/useGameClient';
import InspectableCard from '@/card/components/InspectableCard.vue';

const state = useGameState();
const ui = useGameUi();
</script>

<template>
  <Transition appear>
    <div
      v-if="'source' in state.interaction.ctx && !ui.selectedCard"
      class="interaction-card"
    >
      <InspectableCard
        :card-id="state.interaction.ctx.source"
        :is-interactive="false"
      >
        <GameCard
          :card-id="state.interaction.ctx.source"
          :is-interactive="false"
          style="--pixel-scale: 1"
        />
      </InspectableCard>
    </div>
  </Transition>
</template>

<style scoped lang="postcss">
.interaction-card {
  position: absolute;
  right: var(--size-11);
  top: 60%;
  translate: 0 -50%;
  z-index: 2;

  &.v-enter-active,
  &.v-leave-active {
    transition: all 0.3s var(--ease-3);
  }

  &.v-enter-from,
  &.v-leave-to {
    translate: var(--size-8) 0;
    opacity: 0;
  }
}
</style>
