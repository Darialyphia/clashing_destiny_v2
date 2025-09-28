<script setup lang="ts">
import {
  useBoardSide,
  useFxEvent,
  useGameClient,
  useGameUi
} from '../composables/useGameClient';
import InspectableCard from '@/card/components/InspectableCard.vue';
import { useResizeObserver } from '@vueuse/core';
import { throttle } from 'lodash-es';
import { FX_EVENTS } from '@game/engine/src/client/controllers/fx-controller';
import SmallCardBack from '@/card/components/SmallCardBack.vue';

const { playerId } = defineProps<{ playerId: string }>();

const boardSide = useBoardSide(computed(() => playerId));

const { playerId: activePlayerId } = useGameClient();
const ui = useGameUi();
const root = useTemplateRef<HTMLElement>('root');

const cardSpacing = ref(0);

const computeSpacing = () => {
  if (!root.value) return 0;
  if (!boardSide.value.destinyZone.length) {
    cardSpacing.value = 0;
    return;
  }

  const allowedWidth = root.value.clientWidth;
  // const totalWidth = [...root.value.children].reduce((total, child) => {
  //   return total + child.clientWidth;
  // }, 0);

  // const excess = totalWidth - allowedWidth;

  // cardSpacing.value = Math.min(
  //   -excess / (boardSide.value.destinyZone.length - 1),
  //   0
  // );

  const lastCardWidth = [...root.value.children].at(-1)!.clientWidth;
  const childrenWidth = [...root.value.children].reduce(
    (total, child) => total + child.clientWidth,
    0
  );
  if (childrenWidth <= allowedWidth) {
    cardSpacing.value = lastCardWidth;
    return;
  }
  cardSpacing.value = Math.round(
    (allowedWidth - lastCardWidth) / root.value.children.length
  );
};

watch(
  [
    root,
    computed(() => boardSide.value.destinyZone.length),
    computed(() => ui.value.selectedManaCostIndices.length)
  ],
  () => {
    nextTick(computeSpacing);
  },
  { immediate: true }
);

useResizeObserver(root, throttle(computeSpacing, 50));

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

const displayedCards = computed(() => {
  return [
    ...boardSide.value.destinyZone.map(card => {
      return {
        type: 'destiny',
        cardId: card
      };
    })
  ];
});
</script>

<template>
  <div
    class="destiny-zone"
    ref="root"
    :id="`destiny-zone-${playerId}`"
    :class="{ 'player-2': playerId !== activePlayerId }"
  >
    <div v-for="(card, index) in displayedCards" :key="card.cardId">
      <InspectableCard
        v-if="activePlayerId === playerId"
        :card-id="card.cardId"
        side="top"
      >
        <SmallCardBack
          :key="card.cardId"
          class="item"
          :style="{ '--index': index }"
        />
      </InspectableCard>
      <SmallCardBack v-else class="item" :style="{ '--index': index }" />
    </div>
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
  transform: translateX(
    calc(var(--index) * v-bind(cardSpacing) * 1px * var(--spacing-offset))
  );
}
</style>
