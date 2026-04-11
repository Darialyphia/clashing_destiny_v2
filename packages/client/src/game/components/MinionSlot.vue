<script setup lang="ts">
import type { SerializedBoardSlot } from '@game/engine/src/board/board-slot.entity';
import { useGameState } from '../composables/useGameClient';
import { INTERACTION_STATES } from '@game/engine/src/game/game.enums';

const { boardSlot } = defineProps<{
  boardSlot: SerializedBoardSlot;
}>();

const state = useGameState();
const isTargetable = computed(() => {
  if (isSelected.value) {
    return false;
  }

  const interaction = state.value.interaction;
  if (interaction.state !== INTERACTION_STATES.SELECTING_MINION_SLOT) {
    return false;
  }
  return interaction.ctx.elligiblePositions.some(
    pos =>
      pos.playerId === boardSlot.playerId &&
      pos.row === boardSlot.row &&
      pos.slot === boardSlot.position
  );
});

const isSelected = computed(() => {
  const interaction = state.value.interaction;
  if (interaction.state !== INTERACTION_STATES.SELECTING_MINION_SLOT) {
    return false;
  }
  return interaction.ctx.selectedPositions.some(
    pos =>
      pos.player === boardSlot.playerId &&
      pos.row === boardSlot.row &&
      pos.slot === boardSlot.position
  );
});
</script>

<template>
  <div
    class="board-slot"
    :class="{
      'is-targetable': isTargetable,
      'is-selected': isSelected
    }"
  >
    {{ boardSlot.canSummon }}
  </div>
</template>

<style scoped lang="postcss">
.board-slot {
  width: 148px;
  height: 130px;
  background: url(@/assets/ui/board-small-card-slot.png) no-repeat center;

  &.is-targetable {
    background: url(@/assets/ui/board-small-card-slot-targetable.png) no-repeat
      center;
  }
  &.is-selected {
    background: url(@/assets/ui/board-small-card-slot-selected.png) no-repeat
      center;
  }
}
</style>
