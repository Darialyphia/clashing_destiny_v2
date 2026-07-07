<script setup lang="ts">
import type { PlayerViewModel } from '@game/engine/src/client/view-models/player.model';
import { useGameClient, useGameUi } from '../composables/useGameClient';

const { battlefield } = defineProps<{
  battlefield: PlayerViewModel['leftBattlefield'];
}>();

const { playerId } = useGameClient();

const ui = useGameUi();
const { client } = useGameClient();

const canInteract = computed(() => {
  if (playerId.value !== battlefield.player.id) return false;
  if (!ui.value.selectedCard) return false;
  if (!ui.value.selectedCard.canScore) return false;

  const card = ui.value.selectedCard;
  return battlefield.spaces.some(space => space.card?.equals(card));
});

const onMousedown = (e: MouseEvent) => {
  if (e.button !== 0) return;
  if (!canInteract.value) return;

  client.value.score(ui.value.selectedCard!.id);
};
</script>

<template>
  <button
    :disabled="!canInteract"
    class="score"
    :class="{
      win: battlefield.commandmentScore > battlefield.opponentCommandmentScore,
      lose: battlefield.commandmentScore < battlefield.opponentCommandmentScore
    }"
    @mouseup="onMousedown"
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
  height: 37px;
  display: grid;
  place-content: center;
  transition: font-size 0.2s var(--ease-3);

  &:not(:disabled) {
    animation: score-golden-glow 2s infinite ease-in-out;
    font-size: var(--font-size-5);
    &:hover {
      background-color: var(--yellow-2);
    }
  }
}

.win {
  color: var(--green-6);
}
.lose {
  color: var(--red-6);
}

@keyframes score-golden-glow {
  0%,
  100% {
    filter: drop-shadow(0 0 3px var(--yellow-4))
      drop-shadow(0 0 6px var(--yellow-6));
  }
  50% {
    filter: drop-shadow(0 0 6px var(--yellow-3))
      drop-shadow(0 0 30px var(--yellow-3));
  }
}
</style>
