<script setup lang="ts">
import { PopoverTrigger, PopoverRoot, PopoverContent } from 'reka-ui';
import { useSandbox } from '../composables/useSandbox';
import GameBoard from './GameBoard.vue';

const { players } = defineProps<{
  players: Parameters<typeof useSandbox>[0]['players'];
}>();

const sandbox = useSandbox({
  rngSeed: `sandbox-${Math.random().toString(36).substring(2, 15)}`,
  players
});

const isSandboxPopoverOpened = ref(false);
</script>

<template>
  <GameBoard v-if="sandbox.client.value.isReady" />
  <PopoverRoot v-model:open="isSandboxPopoverOpened">
    <PopoverTrigger class="fixed top-0 left-0 bg-gray-10 p-3">
      Sandbox Tools
    </PopoverTrigger>

    <PopoverContent class="flex flex-col gap-2 p-4 bg-gray-10">
      <button
        v-for="(player, index) in players"
        :key="player.id"
        @click="sandbox.playerId.value = player.id"
      >
        Switch to Player {{ index + 1 }}
      </button>
      <label>
        <input type="checkbox" v-model="sandbox.autoSwitchPlayer.value" />
        Auto Switch to Active Player
      </label>
      <button @click="sandbox.rewindOneStep()">Rewind one step</button>
      <button @click="sandbox.restart()">Restart Game</button>
      <div class="h-13 overflow-auto">
        <h3 class="font-bold mb-2">History</h3>
        <div
          v-for="(input, index) in sandbox.client.value.history"
          :key="index"
          class="text-sm cursor-pointer hover:underline"
          @click="sandbox.rewindTo(index)"
        >
          {{ input.type }}
        </div>
      </div>
    </PopoverContent>
  </PopoverRoot>
</template>

<style scoped lang="postcss"></style>
