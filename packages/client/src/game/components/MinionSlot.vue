<script setup lang="ts">
import type { PlayerViewModel } from '@game/engine/src/client/view-models/player.model';
import GameCard from './GameCard.vue';
import { INTERACTION_STATES } from '@game/engine/src/game/systems/game-interaction.system';
import type { SerializedBoardMinionSlot } from '@game/engine/src/board/board-minion-slot.entity';
import InspectableCard from '@/card/components/InspectableCard.vue';
import { useGameClient, useGameState } from '../composables/useGameClient';

const props = defineProps<{
  slot: SerializedBoardMinionSlot;
}>();

const state = useGameState();
const client = useGameClient();

const player = computed(() => {
  return state.value.entities[props.slot.playerId] as PlayerViewModel;
});

const isHighlighted = computed(() => {
  return (
    state.value.interaction.state ===
      INTERACTION_STATES.SELECTING_MINION_SLOT &&
    state.value.interaction.ctx.elligiblePosition.some(p => {
      return (
        p.playerId === props.slot.playerId &&
        p.slot === props.slot.position &&
        p.zone === props.slot.zone
      );
    })
  );
});
</script>

<template>
  <div
    class="minion-slot"
    :class="{ highlighted: isHighlighted }"
    :id="`minion-slot-${props.slot.playerId}-${props.slot.position}-${props.slot.zone}`"
    @click="
      client.ui.onMinionSlotClick({
        player: player,
        slot: props.slot.position,
        zone: props.slot.zone
      })
    "
  >
    <InspectableCard
      v-if="props.slot.minion"
      :card-id="props.slot.minion"
      side="right"
    >
      <GameCard :card-id="props.slot.minion" class="minion-slot-card" />
    </InspectableCard>
  </div>
</template>

<style scoped lang="postcss">
.minion-slot {
  border: solid 2px var(--gray-6);
  /* aspect-ratio: var(--card-width-unitless) / var(--card-height-unitless); */
  height: 100%;
  position: relative;
  border-radius: var(--radius-2);
  &.highlighted {
    border-color: cyan;
    background-color: hsl(200 100% 50% / 0.25);
  }
  & > * {
    position: absolute;
    inset: 0;
    /* display: grid;
    place-content: center; */
  }
}
</style>
