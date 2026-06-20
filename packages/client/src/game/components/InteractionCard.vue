<script setup lang="ts">
import GameCard from './GameCard.vue';
import { useGameState } from '../composables/useGameClient';

const state = useGameState();
</script>

<template>
  <Transition appear>
    <div v-if="'card' in state.interaction.ctx" class="interaction-card">
      <GameCard :card-id="state.interaction.ctx.card" :is-interactive="false" />
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
