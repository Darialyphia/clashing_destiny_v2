<script setup lang="ts">
import { useSandbox } from '../composables/useSandbox';
import GameBoard from './GameBoard.vue';

const { players } = defineProps<{
  players: Parameters<typeof useSandbox>[0]['players'];
}>();

const sandbox = useSandbox({
  rngSeed: 'sandbox',
  players
});
</script>

<template>
  <GameBoard v-if="sandbox.isReady" />
</template>

<style scoped lang="postcss"></style>
