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
import CardStats from './CardStats.vue';
import CardActions from './CardActions.vue';

const props = defineProps<{
  minionSlot: SerializedBoardMinionSlot;
}>();

const client = useGameClient();

const { player, isHighlighted } = useMinionSlot(
  computed(() => props.minionSlot)
);

const card = useMaybeEntity<CardViewModel>(
  computed(() => props.minionSlot.minion)
);

const isActionsPopoverOpened = computed({
  get() {
    if (!card.value) return false;
    if (!client.value.ui.selectedCard) return false;
    return client.value.ui.selectedCard.equals(card.value);
  },
  set(value) {
    if (!card.value) return;
    if (value) {
      client.value.ui.select(card.value);
    } else {
      client.value.ui.unselect();
    }
  }
});
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
    <InspectableCard v-if="card" :card-id="card.id" side="right">
      <PopoverRoot v-model:open="isActionsPopoverOpened">
        <PopoverAnchor />
        <div
          class="minion"
          :style="{ '--bg': `url(${card?.imagePath})` }"
          @click="client.ui.onCardClick(card)"
        />
        <PopoverPortal :disabled="card.location === 'hand'">
          <PopoverContent :side-offset="-50">
            <CardActions
              :card="card"
              v-model:is-opened="isActionsPopoverOpened"
            />
          </PopoverContent>
        </PopoverPortal>
      </PopoverRoot>
    </InspectableCard>
    <CardStats v-if="card" :card-id="card.id" />
  </div>
</template>

<style scoped lang="postcss">
.minion-slot {
  --pixel-scale: 1;
  width: calc(var(--minion-slot-width) * var(--pixel-scale));
  height: calc(var(--minion-slot-height) * var(--pixel-scale));
  border-radius: var(--radius-2);
  background: url('/assets/ui/card-board-front-2.png') no-repeat center;
  background-size: cover;
  position: relative;
  &:hover {
    border-color: var(--cyan-4);
  }
  &.highlighted {
    border-color: cyan;
    background-color: hsl(200 100% 50% / 0.25);
  }
}

.minion {
  width: 100%;
  aspect-ratio: 1;
  --pixel-scale: 2;
  border-radius: var(--radius-2);
  background: var(--bg) no-repeat;
  background-position: center 75%;
  background-size: calc(96px * var(--pixel-scale))
    calc(96px * var(--pixel-scale));
}
</style>
