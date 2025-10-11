<script setup lang="ts">
import type { SerializedBoardSlot } from '@game/engine/src/board/board-slot.entity';
import InspectableCard from '@/card/components/InspectableCard.vue';
import { useGameUi, useMaybeEntity } from '../composables/useGameClient';
import { useMinionSlot } from '../composables/useMinionSlot';
import { CardViewModel } from '@game/engine/src/client/view-models/card.model';
import GameCard from './GameCard.vue';

const { boardSlot: minionSlot } = defineProps<{
  boardSlot: SerializedBoardSlot;
}>();

const ui = useGameUi();

const { player, isHighlighted, isSelected } = useMinionSlot(
  computed(() => minionSlot)
);

const minion = useMaybeEntity<CardViewModel>(computed(() => minionSlot.minion));
</script>

<template>
  <div
    class="minion-slot"
    :class="{
      highlighted: isHighlighted,
      selected: isSelected,
      exhausted: minion?.isExhausted,
      attacking: minion?.isAttacking
    }"
    :id="
      ui.DOMSelectors.minionPosition(
        player.id,
        minionSlot.zone,
        minionSlot.position
      ).id
    "
    @click="
      ui.onMinionSlotClick({
        player: player,
        slot: minionSlot.position,
        zone: minionSlot.zone
      })
    "
  >
    <InspectableCard
      v-if="minion"
      :card-id="minion.id"
      side="left"
      :side-offset="50"
    >
      <GameCard
        class="minion-clickable-area"
        variant="small"
        :card-id="minion.id"
        show-stats
        flipped
      />
    </InspectableCard>
  </div>
</template>

<style scoped lang="postcss">
.minion-slot {
  --pixel-scale: 1;
  --padding: 2px;
  background: url('/assets/ui/board-small-card-slot.png') no-repeat center;
  background-size: cover;
  width: calc(var(--card-small-width) + var(--padding) * 2);
  height: calc(var(--card-small-height) + var(--padding) * 2);
  padding: var(--padding);
  &:not(:is(.attacking, .exhausted)):hover {
    border-color: var(--cyan-4);
  }
  &.attacking {
    border-color: var(--red-4);
  }
  &.highlighted {
    background-image: url('/assets/ui/board-small-card-slot-targetable.png');
  }
  &.selected {
    background: url('/assets/ui/board-small-card-slot-selected.png') no-repeat
      center;
  }
}
</style>
