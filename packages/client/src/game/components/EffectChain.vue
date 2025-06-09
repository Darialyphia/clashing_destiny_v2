<script setup lang="ts">
import InspectableCard from '@/card/components/InspectableCard.vue';
import { useGameState } from '../composables/useGameClient';
import GameCard from './GameCard.vue';

const state = useGameState();
</script>

<template>
  <div class="effect-chain">
    <InspectableCard
      v-for="(effect, index) in state.effectChain?.stack"
      :key="index"
      :card-id="effect"
    >
      <GameCard :card-id="effect" :interactive="false" />
    </InspectableCard>
  </div>
</template>

<style scoped lang="postcss">
.effect-chain {
  flex-grow: 1;
  align-self: stretch;
  display: flex;
  gap: var(--size-3);

  & > * {
    aspect-ratio: var(--card-ratio);
    position: relative;
    & > * {
      position: absolute;
      inset: 0;
    }
  }
}
</style>
