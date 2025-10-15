<script setup lang="ts">
import type { SerializedBoardSlot } from '@game/engine/src/board/board-slot.entity';
import InspectableCard from '@/card/components/InspectableCard.vue';
import { useGameUi, useMaybeEntity } from '../composables/useGameClient';
import { useMinionSlot } from '../composables/useMinionSlot';
import { CardViewModel } from '@game/engine/src/client/view-models/card.model';
import GameCard from './GameCard.vue';
import { gameStateRef } from '../composables/gameStateRef';
import UiSimpleTooltip from '@/ui/components/UiSimpleTooltip.vue';

const { boardSlot: minionSlot } = defineProps<{
  boardSlot: SerializedBoardSlot;
}>();

const ui = useGameUi();

const { player, isHighlighted, isSelected } = useMinionSlot(
  computed(() => minionSlot)
);

const minion = useMaybeEntity<CardViewModel>(computed(() => minionSlot.minion));

const visibleModifiers = gameStateRef(() => {
  return (
    minion.value?.modifiers.filter(
      modifier => modifier.icon && modifier.stacks > 0
    ) ?? []
  );
});
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
      <div class="relative">
        <GameCard variant="small" :card-id="minion.id" show-stats flipped />
        <div class="modifiers">
          <UiSimpleTooltip
            v-for="modifier in visibleModifiers"
            :key="modifier.id"
            use-portal
            side="left"
          >
            <template #trigger>
              <div
                :style="{ '--bg': `url(/assets/icons/${modifier.icon}.png)` }"
                :alt="modifier.name"
                :data-stacks="modifier.stacks > 1 ? modifier.stacks : undefined"
                class="modifier"
              />
            </template>

            <div class="font-7">{{ modifier.name }}</div>
            {{ modifier.description }}
          </UiSimpleTooltip>
        </div>
      </div>
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

.modifiers {
  position: absolute;
  top: var(--size-2);
  left: var(--size-2);
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--size-2);
  --pixel-scale: 2;
}

.modifier {
  width: 24px;
  aspect-ratio: 1;
  background: var(--bg) no-repeat center center;
  background-size: cover;
  pointer-events: auto;
  position: relative;
  &::after {
    content: attr(data-stacks);
    position: absolute;
    bottom: -5px;
    right: -5px;
    font-size: var(--font-size-2);
    color: white;
    paint-order: stroke fill;
    font-weight: var(--font-weight-7);
    -webkit-text-stroke: 2px black;
  }
}
</style>
