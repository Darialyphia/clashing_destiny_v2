<script setup lang="ts">
import { GAME_PHASES } from '@game/engine/src/game/game.enums';
import { useGameClient, useGameState } from '../composables/useGameClient';

const client = useGameClient();
const state = useGameState();
</script>

<template>
  <div class="debug-tools">
    <button
      @click="
        () => {
          console.log(client);
        }
      "
    >
      Debug client
    </button>
    <div>
      <div>Phase: {{ state.phase.state }}</div>
      <div>
        Interaction: {{ state.interaction.state }} ({{
          state.interaction.ctx.player
        }})
      </div>
      <div v-if="state.phase.state === GAME_PHASES.ATTACK">
        Combat step: {{ state.phase.ctx.step }}
      </div>
      <div>Chain: {{ state.effectChain?.player ?? 'none' }}</div>
    </div>
  </div>
</template>

<style scoped lang="postcss">
.debug-tools {
  position: fixed;
  bottom: 0;
  left: 0;
  z-index: 1000;
  padding: var(--size-3);
  background-color: rgba(0, 0, 0, 0.5);
  > button {
    padding: var(--size-1);
    border: solid 1px hsl(0 0 100% / 0.5);
  }
}
</style>
