<script setup lang="ts">
import {
  useBoardSide,
  useFxEvent,
  useGameClient
} from '../composables/useGameClient';
import InspectableCard from '@/card/components/InspectableCard.vue';
import { useResizeObserver } from '@vueuse/core';
import { FX_EVENTS } from '@game/engine/src/client/controllers/fx-controller';
import SmallCardBack from '@/card/components/SmallCardBack.vue';
import CountChip from './CountChip.vue';
import { clamp } from '@game/shared';
import CardActionsPopover from './CardActionsPopover.vue';

const { playerId, teachingMode } = defineProps<{
  playerId: string;
  teachingMode: boolean;
}>();

const boardSide = useBoardSide(computed(() => playerId));

const { playerId: activePlayerId } = useGameClient();
const root = useTemplateRef<HTMLElement>('root');

const cardBanishedAsDestinyCost = ref<Array<{ card: string; index: number }>>(
  []
);

useFxEvent(FX_EVENTS.PRE_PLAYER_PAY_FOR_DESTINY_COST, async event => {
  if (event.player.id !== playerId) return;
  event.cards.forEach(card => {
    cardBanishedAsDestinyCost.value[card.index] = card;
  });
});

useFxEvent(FX_EVENTS.PLAYER_PAY_FOR_DESTINY_COST, async event => {
  if (event.player.id !== playerId) return;
  cardBanishedAsDestinyCost.value = [];
});

const rootContainerSize = ref({ w: 0, h: 0 });
useResizeObserver(root, () => {
  const el = root.value;
  if (!el) return;
  const rect = el.getBoundingClientRect();
  rootContainerSize.value = { w: rect.width, h: rect.height };
});

const cardW = computed(() => {
  return parseInt(
    getComputedStyle(document.documentElement).getPropertyValue(
      '--card-small-width-unitless'
    )
  );
});

const destinyZoneSize = computed(() => boardSide.value.destinyZone.length);
const step = computed(() => {
  if (destinyZoneSize.value <= 1) return 0;
  const natural =
    (rootContainerSize.value.w - cardW.value) / (destinyZoneSize.value - 1);
  return clamp(natural, 0, cardW.value);
});

const cards = computed(() => {
  if (destinyZoneSize.value === 0) return [];

  return boardSide.value.destinyZone.map((cardId, i) => ({
    cardId: cardId,
    x: i * step.value,
    z: i
  }));
});
</script>

<template>
  <div
    class="destiny-zone"
    ref="root"
    :id="`destiny-zone-${playerId}`"
    :class="{ 'player-2': playerId !== activePlayerId }"
  >
    <div
      v-for="card in cards"
      :key="card.cardId"
      class="item"
      :style="{
        '--x': `${card.x}px`,
        '--z': card.z
      }"
    >
      <CardActionsPopover :card-id="card.cardId">
        <InspectableCard
          v-if="activePlayerId === playerId || teachingMode"
          :card-id="card.cardId"
          side="top"
        >
          <SmallCardBack :key="card.cardId" />
        </InspectableCard>
        <SmallCardBack v-else />
      </CardActionsPopover>
    </div>

    <CountChip
      :count="cards.length"
      :style="{ '--z': cards.length + 1 }"
      class="count-chip"
    />
  </div>
</template>

<style scoped lang="postcss">
.destiny-zone {
  --piwxel-scale: 1;
  display: grid;
  position: relative;
  overflow: hidden;
  justify-items: start;
  align-items: center;
  grid-template-rows: 1fr;
  grid-template-columns: 1fr;
  height: 100%;
  border: solid 1px #985e25;
  padding-inline: 4px;
  z-index: 1;
  --spacing-offset: 1;
  &.player-2 {
    justify-items: end;
    --spacing-offset: -1;
  }
  /* & > *:not(:last-child) {
    margin-right: calc(1px * v-bind(cardSpacing));
  } */

  > * {
    grid-column: 1;
    grid-row: 1;
  }
}

.item {
  position: absolute;
  .destiny-zone.player-2 & {
    right: 0;
  }
  .destiny-zone:not(.player-2) & {
    left: 0;
  }
  transform: translateX(calc(var(--spacing-offset) * var(--x)));
  z-index: var(--z);
}

.count-chip {
  position: absolute;
  bottom: 0;
  z-index: var(--z);
  .destiny-zone.player-2 & {
    left: 0;
  }
  .destiny-zone:not(.player-2) & {
    right: 0;
  }
}
</style>
