<script setup lang="ts">
import { GAME_PHASES } from '@game/engine/src/game/game.enums';
import { useGameClient, useGameState } from '../composables/useGameClient';
import FancyButton from '@/ui/components/FancyButton.vue';

const client = useGameClient();
const state = useGameState();

const canEndTurn = computed(() => {
  return (
    state.value.phase.state === GAME_PHASES.MAIN &&
    client.value.playerId === state.value.turnPlayer
  );
});
</script>

<template>
  <div class="action-buttons">
    <FancyButton
      v-if="state.effectChain"
      text="Pass chain"
      @click="
        client.adapter.dispatch({
          type: 'passChain',
          payload: {
            playerId: client.playerId
          }
        })
      "
    />
    <FancyButton
      text="End turn"
      :disabled="!canEndTurn"
      @click="
        client.adapter.dispatch({
          type: 'declareEndTurn',
          payload: {
            playerId: client.playerId
          }
        })
      "
    />
  </div>
</template>

<style scoped lang="postcss">
.action-buttons {
  position: fixed;
  display: flex;
  flex-direction: column;
  gap: var(--size-2);
  bottom: var(--size-3);
  right: var(--size-3);
  z-index: 2;
  align-items: center;
}
</style>
