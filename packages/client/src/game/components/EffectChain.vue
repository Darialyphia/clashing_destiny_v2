<script setup lang="ts">
import InspectableCard from '@/card/components/InspectableCard.vue';
import { useGameState } from '../composables/useGameClient';
import GameCard from './GameCard.vue';

const state = useGameState();
</script>

<template>
  <div class="effect-chain" id="effect-chain">
    <InspectableCard
      v-for="(effect, index) in state.effectChain?.stack"
      :key="index"
      :card-id="effect"
      class="effect-chain-card-wrapper"
    >
      <GameCard
        :card-id="effect"
        :interactive="false"
        class="effect-chain-card"
      />
    </InspectableCard>
  </div>
</template>

<style scoped lang="postcss">
.effect-chain {
  flex-grow: 1;
  align-self: stretch;
  display: flex;
  gap: var(--size-3);
  height: var(--size-11);
}

:global(.effect-chain > *) {
  position: relative;
  aspect-ratio: var(--card-ratio);
  overflow: hidden;
  height: 100%;
  /* scale: 2; */
}
</style>
