<script setup lang="ts">
import GameCard from './GameCard.vue';
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
      <GameCard
        :card-id="props.minionSlot.minion"
        class="minion-slot-card"
        image-only
      />
    </InspectableCard>
  </div>
</template>

<style scoped lang="postcss">
.minion-slot {
  border: solid 2px var(--gray-6);
  height: 100%;
  position: relative;
  border-radius: var(--radius-2);
  &:hover {
    border-color: var(--cyan-4);
  }
  &.highlighted {
    border-color: cyan;
    background-color: hsl(200 100% 50% / 0.25);
  }
  & > * {
    position: absolute;
    inset: 0;
  }
}
</style>
