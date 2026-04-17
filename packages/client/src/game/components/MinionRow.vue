<script setup lang="ts">
import type { BoardCellViewModel } from '@game/engine/src/client/view-models/board-cell.model';
import MinionCell from './MinionCell.vue';

const { row } = defineProps<{
  row: BoardCellViewModel[];
}>();
</script>

<template>
  <div class="minion-row">
    <MinionCell v-for="cell in row" :key="cell.id" :cell="cell" />
  </div>
</template>

<style scoped lang="postcss">
.minion-row {
  display: flex;
  gap: 14px;
}
</style>
