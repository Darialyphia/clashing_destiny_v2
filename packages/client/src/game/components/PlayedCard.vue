<script setup lang="ts">
import { INTERACTION_STATES } from '@game/engine/src/game/systems/game-interaction.system';
import { useGameClient, useGameState } from '../composables/useGameClient';
import GameCard from './GameCard.vue';
import CardResizer from './CardResizer.vue';
import InspectableCard from '@/card/components/InspectableCard.vue';

const state = useGameState();
const client = useGameClient();

const card = computed(() => {
  if (state.value.interaction.state !== INTERACTION_STATES.PLAYING_CARD)
    return null;
  if (client.value.playerId !== state.value.interaction.ctx.player) return null;

  return state.value.interaction.ctx.card;
});
</script>

<template>
  <teleport to="#card-portal">
    <div v-if="!card" class="played-card" />
    <div class="played-card">
      <InspectableCard :card-id="card" v-if="card" side="left">
        <CardResizer :card-id="card" :forced-scale="0.5">
          <GameCard :interactive="false" :card-id="card" :auto-scale="false" />
        </CardResizer>
      </InspectableCard>
    </div>
  </teleport>
</template>

<style scoped lang="postcss">
.played-card {
  position: fixed;
  top: 33%;
  right: var(--size-6);
  width: var(--card-width);
  aspect-ratio: 1;
}
</style>
