<script setup lang="ts">
import { useBoardSide, useGameClient } from '../composables/useGameClient';
import MinionSlot from './MinionSlot.vue';

const { playerId } = defineProps<{ playerId: string }>();

const boardSide = useBoardSide(computed(() => playerId));
const client = useGameClient();
const isFlipped = computed(() => client.value.playerId !== playerId);
</script>

<template>
  <div class="minion-zone">
    <div class="minion-row">
      <MinionSlot
        v-for="slot in isFlipped
          ? boardSide.defenseZone.slots
          : boardSide.attackZone.slots"
        :key="slot.position"
        :minion-slot="slot"
      />
    </div>
    <div class="minion-row">
      <MinionSlot
        v-for="slot in isFlipped
          ? boardSide.attackZone.slots
          : boardSide.defenseZone.slots"
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
  gap: var(--size-2);
  .minion-row {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    justify-items: center;
    align-items: center;
  }
}
</style>
