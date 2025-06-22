<script setup lang="ts">
import type { PlayerViewModel } from '@game/engine/src/client/view-models/player.model';
import GameCard from './GameCard.vue';
import { INTERACTION_STATES } from '@game/engine/src/game/systems/game-interaction.system';
import type { SerializedBoardMinionSlot } from '@game/engine/src/board/board-minion-slot.entity';
import InspectableCard from '@/card/components/InspectableCard.vue';
import { useGameClient, useGameState } from '../composables/useGameClient';

const props = defineProps<{
  minionSlot: SerializedBoardMinionSlot;
}>();

const state = useGameState();
const client = useGameClient();

const player = computed(() => {
  return state.value.entities[props.minionSlot.playerId] as PlayerViewModel;
});

const isHighlighted = computed(() => {
  return (
    state.value.interaction.state ===
      INTERACTION_STATES.SELECTING_MINION_SLOT &&
    state.value.interaction.ctx.elligiblePosition.some(p => {
      return (
        p.playerId === props.minionSlot.playerId &&
        p.slot === props.minionSlot.position &&
        p.zone === props.minionSlot.zone
      );
    })
  );
});

// const getspriteFromCardId = (cardId: string) => {
//   const card = state.value.entities[cardId] as CardViewModel;
//   if (!card) return '';
//   return `url(${card.imagePath})`;
// };
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
    <!-- <div
      v-if="props.minionSlot.minion"
      class="minion-slot-sprite"
      :style="{ '--bg': getspriteFromCardId(props.minionSlot.minion) }"
    /> -->
  </div>
</template>

<style scoped lang="postcss">
.minion-slot {
  border: solid 2px var(--gray-6);
  /* aspect-ratio: var(--card-width-unitless) / var(--card-height-unitless); */
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
    /* display: grid;
    place-content: center; */
  }
}

/* .minion-slot-sprite {
  background-image: var(--bg);
  background-position: center;
  transform: scale(2);
  aspect-ratio: 1;
  image-rendering: pixelated;
  position: relative;
  pointer-events: none;
} */
</style>
