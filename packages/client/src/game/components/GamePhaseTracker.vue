<script setup lang="ts">
import { GAME_PHASES } from '@game/engine/src/game/game.enums';
import { useGameState } from '../composables/useGameClient';

const state = useGameState();
</script>

<template>
  <div
    class="phase"
    :class="{ active: state.phase.state === GAME_PHASES.DRAW }"
  >
    DRAW
  </div>
  <div
    class="phase"
    :class="{ active: state.phase.state === GAME_PHASES.DESTINY }"
  >
    DESTINY
  </div>
  <div
    class="phase"
    :class="{ active: state.phase.state === GAME_PHASES.MAIN }"
  >
    MAIN
  </div>
  <div
    class="phase"
    :class="{ active: state.phase.state === GAME_PHASES.ATTACK }"
  >
    COMBAT
  </div>
  <div class="phase" :class="{ active: state.phase.state === GAME_PHASES.END }">
    END
  </div>
</template>

<style scoped lang="postcss">
.phase {
  border: solid 2px white;
  border-radius: var(--radius-2);
  padding: var(--size-2) var(--size-3);
  font-size: var(--font-size-3);
  &.active {
    border-color: var(--cyan-4);
  }
}
</style>
