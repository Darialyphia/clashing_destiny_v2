<script setup lang="ts">
import type { BoardCellViewModel } from '@game/engine/src/client/view-models/board-cell.model';

const { cell } = defineProps<{
  cell: BoardCellViewModel;
}>();
</script>

<template>
  <div class="minion-cell"></div>
</template>

<style scoped lang="postcss">
.minion-cell {
  width: 148px;
  height: 130px;
  background: url('@/assets/ui/board-small-card-slot.png') no-repeat center
    center;
}
</style>
