<script setup lang="ts">
import CardBack from '@/card/components/CardBack.vue';
import {
  useBoardSide,
  useFxEvent,
  useGameClient
} from '../composables/useGameClient';
import InspectableCard from '@/card/components/InspectableCard.vue';
import { useResizeObserver } from '@vueuse/core';
import { throttle } from 'lodash-es';
import { FX_EVENTS } from '@game/engine/src/client/controllers/fx-controller';

const { playerId } = defineProps<{ playerId: string }>();

const boardSide = useBoardSide(computed(() => playerId));

const client = useGameClient();

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
  cardSpacing.value = Math.round(
    (allowedWidth - lastCardWidth) / root.value.children.length
  );
};

watch(
  [root, computed(() => boardSide.value.destinyZone.length)],
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
</script>

<template>
  <div class="destiny-zone" ref="root" :id="`destiny-zone-${playerId}`">
    <template v-for="(card, index) in boardSide.destinyZone" :key="card">
      <InspectableCard
        v-if="client.playerId === playerId"
        :card-id="card"
        side="top"
      >
        <CardBack :key="card" class="item" :style="{ '--index': index }" />
      </InspectableCard>
      <CardBack v-else class="item" :style="{ '--index': index }" />
    </template>
  </div>
</template>

<style scoped lang="postcss">
.destiny-zone {
  display: flex;
  position: relative;
  overflow: hidden;
  /* & > *:not(:last-child) {
    margin-right: calc(1px * v-bind(cardSpacing));
  } */
}

.item {
  position: absolute;
  height: 100%;
  top: 0;
  left: calc(var(--index) * v-bind(cardSpacing) * 1px);
}

:global(.destiny-zone > *) {
  aspect-ratio: var(--card-ratio);
}
</style>
