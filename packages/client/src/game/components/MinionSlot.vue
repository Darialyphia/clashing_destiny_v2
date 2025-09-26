<script setup lang="ts">
import type { SerializedBoardMinionSlot } from '@game/engine/src/board/board-minion-slot.entity';
import InspectableCard from '@/card/components/InspectableCard.vue';
import { useGameClient, useMaybeEntity } from '../composables/useGameClient';
import { useMinionSlot } from '../composables/useMinionSlot';
import { CardViewModel } from '@game/engine/src/client/view-models/card.model';
import {
  PopoverRoot,
  PopoverAnchor,
  PopoverPortal,
  PopoverContent
} from 'reka-ui';
import CardActions from './CardActions.vue';
import GameCard from './GameCard.vue';

const props = defineProps<{
  minionSlot: SerializedBoardMinionSlot;
}>();

const client = useGameClient();

const { player, isHighlighted, isSelected } = useMinionSlot(
  computed(() => props.minionSlot)
);

const minion = useMaybeEntity<CardViewModel>(
  computed(() => props.minionSlot.minion)
);

const isActionsPopoverOpened = computed({
  get() {
    if (!minion.value) return false;
    if (!client.value.ui.selectedCard) return false;
    return client.value.ui.selectedCard.equals(minion.value);
  },
  set(value) {
    if (!minion.value) return;
    if (value) {
      client.value.ui.select(minion.value);
    } else {
      client.value.ui.unselect();
    }
  }
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
      v-if="minion"
      :card-id="minion.id"
      side="left"
      :side-offset="50"
    >
      <PopoverRoot v-model:open="isActionsPopoverOpened">
        <PopoverAnchor />
        <GameCard
          class="minion-clickable-area"
          variant="small"
          :id="
            client.ui.DOMSelectors.minionClickableArea(
              props.minionSlot.playerId,
              props.minionSlot.zone,
              props.minionSlot.position
            ).id
          "
          :card-id="minion.id"
          :class="{
            targetable: minion.canBeTargeted
          }"
          @click="client.ui.onCardClick(minion)"
        />
        <PopoverPortal :disabled="minion.location === 'hand'">
          <PopoverContent :side-offset="-50">
            <CardActions
              :card="minion"
              v-model:is-opened="isActionsPopoverOpened"
            />
          </PopoverContent>
        </PopoverPortal>
      </PopoverRoot>
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
