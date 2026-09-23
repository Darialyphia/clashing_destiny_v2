<script setup lang="ts">
import {
  useGameClient,
  useGameState,
  useGameUi
} from '../composables/useGameClient';

const ui = useGameUi();
const { playerId, client } = useGameClient();
const state = useGameState();

const isDev = import.meta.env.DEV;
</script>
<template>
  <div v-if="isDev" class="debug">
    <div>You are: {{ playerId }}</div>
    <div>Active players: {{ client.getActivePlayerIds().join(', ') }}</div>
    <div>Game Phase: {{ state.phase.state }}</div>
    <div>Selected Card: {{ ui.selectedCard?.id }}</div>
    <div>Interaction State: {{ state.interaction.state }}</div>
    <div>
      Optimistic played card id:
      {{ client.optimisticStateManager.state.playedCardId }}
    </div>
  </div>
</template>

<style scoped lang="postcss">
.debug {
  position: fixed;
  top: var(--size-14);
  right: 0;
  color: white;
  font-size: var(--font-size-0);
  z-index: 10;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  padding: var(--size-4);
  max-width: var(--size-xs);
  @screen lt-lg {
    font-size: var(--font-size-00);
    padding: var(--size-2);
    left: unset;
    right: 0;
  }
}
</style>
