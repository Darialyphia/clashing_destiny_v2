<script setup lang="ts">
import { useBoardSide } from '../composables/useGameClient';
import MinionSlot from './MinionSlot.vue';

const { playerId } = defineProps<{ playerId: string }>();

const boardSide = useBoardSide(computed(() => playerId));
</script>

<template>
  <div class="minion-zone">
    <div class="minion-row">
      <MinionSlot
        v-for="slot in boardSide.attackZone.slots"
        :key="slot.position"
        :minion-slot="slot"
      />
    </div>
    <div class="minion-row">
      <MinionSlot
        v-for="slot in boardSide.defenseZone.slots"
        :key="slot.position"
        :minion-slot="slot"
      />
    </div>
  </div>
</template>

<style scoped lang="postcss">
.minion-zone {
  display: grid;
  justify-self: center;

  .minion-row {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    justify-items: center;
    align-items: center;
  }
}
</style>
