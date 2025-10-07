<script setup lang="ts">
import { useGameUi } from '../composables/useGameClient';
import GameCard from './GameCard.vue';
import CardResizer from './CardResizer.vue';
import InspectableCard from '@/card/components/InspectableCard.vue';

const ui = useGameUi();
const cardId = computed(() => {
  return ui.value.playedCardId;
});
</script>

<template>
  <teleport to="#card-portal">
    <div id="played-card">
      <InspectableCard :card-id="cardId" v-if="cardId" side="left">
        <CardResizer :card-id="cardId" :forced-scale="0.5">
          <GameCard
            :interactive="false"
            :card-id="cardId"
            :auto-scale="false"
          />
        </CardResizer>
      </InspectableCard>
    </div>
  </teleport>
</template>

<style scoped lang="postcss">
#played-card {
  position: fixed;
  top: 33%;
  right: var(--size-6);
  width: var(--card-width);
  height: var(--card-height);
  pointer-events: none;
  & > * {
    display: block;
    width: var(--card-width);
    height: var(--card-height);
  }
}
</style>
