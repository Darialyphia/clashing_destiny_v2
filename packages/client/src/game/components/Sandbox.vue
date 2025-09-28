<script setup lang="ts">
import { useSandbox } from '../composables/useSandbox';
import GameBoard from './GameBoard.vue';

const { players } = defineProps<{
  players: Parameters<typeof useSandbox>[0]['players'];
}>();

const sandbox = useSandbox({
  rngSeed: `sandbox-${Math.random().toString(36).substring(2, 15)}`,
  players
});
</script>

<template>
  <GameBoard v-if="sandbox.client.value.isReady" />
  <div class="fixed top-0 left-0 flex gap-2 items-center">
    <button
      v-for="(player, index) in players"
      :key="player.id"
      @click="sandbox.playerId.value = player.id"
    >
      Switch to Player {{ index + 1 }}
    </button>
    <input
      type="checkbox"
      id="auto-switch"
      v-model="sandbox.autoSwitchPlayer.value"
    />
    <label for="auto-switch">Auto Switch to Active Player</label>
  </div>
</template>

<style scoped lang="postcss">
button {
  background: #222;
  border: 1px solid black;
  padding: 0.5rem 1rem;
  margin: 0.5rem;
  cursor: pointer;
}
</style>
