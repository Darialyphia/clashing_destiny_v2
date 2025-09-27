<script setup lang="ts">
import type { SerializedBoardMinionSlot } from '@game/engine/src/board/board-minion-slot.entity';
import InspectableCard from '@/card/components/InspectableCard.vue';
import { useGameClient, useMaybeEntity } from '../composables/useGameClient';
import { useMinionSlot } from '../composables/useMinionSlot';
import { CardViewModel } from '@game/engine/src/client/view-models/card.model';
import GameCard from './GameCard.vue';

const { minionSlot } = defineProps<{
  minionSlot: SerializedBoardMinionSlot;
}>();

const client = useGameClient();

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
      client.ui.DOMSelectors.minionPosition(
        player.id,
        minionSlot.zone,
        minionSlot.position
      ).id
    "
    @click="
      client.ui.onMinionSlotClick({
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
        :class="{
          targetable: minion.canBeTargeted
        }"
      />
    </InspectableCard>
  </div>
</template>

<style scoped lang="postcss">
.minion-slot {
  --pixel-scale: 1;
  --padding: 2px;
  border: solid 1px #985e25;
  width: calc(var(--card-small-width) + var(--padding) * 2);
  height: calc(var(--card-small-height) + var(--padding) * 2);
  &:not(:is(.attacking, .exhausted)):hover {
    border-color: var(--cyan-4);
  }
  &.attacking {
    border-color: var(--red-4);
  }
  &.highlighted {
    border-color: cyan;
  }
  &.selected {
    border-color: var(--yellow-5);
    background: url('/assets/ui/minino-slot-selected.png') no-repeat center;
  }

  &.exhausted .slot-minion {
    filter: grayscale(1) brightness(0.75);
    /* rotate: 90deg; */
  }
}

.slot-minion {
  &.targetable {
    filter: saturate(150%) drop-shadow(0 0 1px red);
  }
}
</style>
