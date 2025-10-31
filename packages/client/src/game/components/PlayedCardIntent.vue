<script setup lang="ts">
import { INTERACTION_STATES } from '@game/engine/src/game/systems/game-interaction.system';
import { useGameState, useMyPlayer } from '../composables/useGameClient';
import GameCard from './GameCard.vue';
import InspectableCard from '@/card/components/InspectableCard.vue';

const state = useGameState();
const player = useMyPlayer();
const cardId = computed(() => {
  if (state.value.interaction.state !== INTERACTION_STATES.PLAYING_CARD) {
    return null;
  }
  if (player.value.id !== state.value.interaction.ctx.player) {
    return null;
  }

  return state.value.interaction.ctx.card;
});
</script>

<template>
  <InspectableCard :card-id="cardId" v-if="cardId" side="left">
    <GameCard
      :interactive="false"
      :card-id="cardId"
      variant="small"
      style="--pixel-scale: 1"
    />
  </InspectableCard>
</template>
