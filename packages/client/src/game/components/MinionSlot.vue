<script setup lang="ts">
import type { SerializedBoardMinionSlot } from '@game/engine/src/board/board-minion-slot.entity';
import InspectableCard from '@/card/components/InspectableCard.vue';
import { useGameClient } from '../composables/useGameClient';
import { useMinionSlot } from '../composables/useMinionSlot';

const props = defineProps<{
  minionSlot: SerializedBoardMinionSlot;
}>();

const client = useGameClient();

const { player, isHighlighted } = useMinionSlot(
  computed(() => props.minionSlot)
);
</script>

<template>
  <div
    class="minion-slot"
    :class="{ highlighted: isHighlighted }"
    :id="`minion-slot-${props.minionSlot.playerId}-${props.minionSlot.position}-${props.minionSlot.zone}`"
    @click="
      client.ui.onMinionSlotClick({
        player: player,
        slot: props.minionSlot.position,
        zone: props.minionSlot.zone
      })
    "
  >
    <InspectableCard
      v-if="props.minionSlot.minion"
      :card-id="props.minionSlot.minion"
      side="right"
    >
      <div class="minion" :style="{ '--bg': '' }" />
      >
    </InspectableCard>
  </div>
</template>

<style scoped lang="postcss">
.minion-slot {
  --pixel-scale: 1;
  border: solid 2px var(--gray-6);
  width: calc(var(--minion-slot-width) * var(--pixel-scale));
  height: calc(var(--minion-slot-height) * var(--pixel-scale));
  border-radius: var(--radius-2);
  background: url('/assets/ui/card-board-front-2.png') no-repeat center;
  background-size: cover;
  &:hover {
    border-color: var(--cyan-4);
  }
  &.highlighted {
    border-color: cyan;
    background-color: hsl(200 100% 50% / 0.25);
  }
}
</style>
