<script setup lang="ts">
import { FX_EVENTS } from '@game/engine/src/client/controllers/fx-controller';
import { useFxEvent, useGameState } from '../composables/useGameClient';
import { waitFor } from '@game/shared';

const state = useGameState();
const isDisplayed = ref(false);

useFxEvent(FX_EVENTS.TURN_START, async () => {
  isDisplayed.value = true;
  await waitFor(1500);
  isDisplayed.value = false;
});
</script>

<template>
  <div v-if="isDisplayed" class="turn-indicator">
    Turn {{ state.turnCount + 1 }}
  </div>
</template>

<style scoped lang="postcss">
.turn-indicator {
  position: fixed;
  top: 38%;
  left: 45%;
  translate:
    -50%,
    -50%;
  color: #d7ad42;
  -webkit-text-stroke: solid 8px black;
  paint-order: stroke fill;
  font-size: var(--font-size-7);
  font-family: 'Cinzel Decorative', cursive;
  font-weight: var(--font-weight-7);
  z-index: 10;
}
</style>
