<script setup lang="ts">
import type { SerializedCreatureZone } from '@game/engine/src/board/board-side.entity';
import MinionSlot from './MinionSlot.vue';

const { zone } = defineProps<{
  zone: SerializedCreatureZone;
}>();
</script>

<template>
  <div class="minion-row">
    <MinionSlot
      v-for="(slot, index) in zone.slots"
      :key="index"
      :board-slot="slot"
    />
  </div>
</template>

<style scoped lang="postcss">
.minion-row {
  display: flex;
  gap: 14px;
  width: 832px;
  padding-inline: 24px;
}
</style>
