<script setup lang="ts">
import type { PlayerViewModel } from '@game/engine/src/client/view-models/player.model';
import { useGameClient, useGameUi } from '../composables/useGameClient';

const { battlefield } = defineProps<{
  battlefield: PlayerViewModel['leftBattlefield'];
}>();

const { playerId } = useGameClient();

const ui = useGameUi();

const canInteract = computed(() => {
  if (playerId.value !== battlefield.player.id) return false;
  if (!ui.value.selectedCard) return false;
  return ui.value.selectedCard.canScore;
});
</script>

<template>
  <button
    :disabled="!canInteract"
    class="score"
    :class="{
      win: battlefield.commandmentScore > battlefield.opponentCommandmentScore,
      lose: battlefield.commandmentScore < battlefield.opponentCommandmentScore
    }"
  >
    {{ battlefield.commandmentScore }}
  </button>
</template>

<style scoped lang="postcss">
.score {
  position: absolute;
  font-size: var(--font-size-4);
  font-weight: var(--font-weight-7);
  color: white;
  -webkit-text-stroke: 2px black;
  paint-order: stroke fill;
  width: 55px;
  text-align: center;

  &:not(:disabled):hover {
    background-color: var(--yellow-2);
  }
}

.win {
  color: var(--green-6);
}
.lose {
  color: var(--red-6);
}
</style>
