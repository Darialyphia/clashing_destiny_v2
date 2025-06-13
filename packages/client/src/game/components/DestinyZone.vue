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
import GameCard from './GameCard.vue';
import { waitFor } from '@game/shared';

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
  const totalWidth = [...root.value.children].reduce((total, child) => {
    return total + child.clientWidth;
  }, 0);

  const excess = totalWidth - allowedWidth;

  cardSpacing.value = Math.min(
    -excess / (boardSide.value.destinyZone.length - 1),
    0
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
    <div v-for="(card, index) in boardSide.destinyZone" :key="card">
      <template v-if="client.playerId === playerId">
        <InspectableCard :card-id="card" side="top">
          <CardBack :key="card" class="item" />
          <GameCard
            v-if="cardBanishedAsDestinyCost[index]"
            :card-id="cardBanishedAsDestinyCost[index].card"
            class="banished-card"
            :id="`banished-card-${cardBanishedAsDestinyCost[index].card}`"
          />
        </InspectableCard>
      </template>
      <CardBack v-else class="item" />
    </div>

    <template v-if="playerId === client.playerId">
      <div
        v-for="index in client.ui.selectedManaCostIndices"
        :key="index"
        class="item mana-card"
      >
        <InspectableCard :card-id="boardSide.hand[index]" side="top">
          <GameCard :card-id="boardSide.hand[index]" class="item" />
        </InspectableCard>
      </div>
    </template>
  </div>
</template>

<style scoped lang="postcss">
.destiny-zone {
  display: flex;
  border: solid 2px white;
  > * {
    position: relative;
  }
  & > *:not(:last-child) {
    margin-right: calc(1px * v-bind(cardSpacing));
  }
}

.item {
  aspect-ratio: var(--card-ratio);
  height: 100%;
}

.mana-card {
  overflow: hidden;
}

.banished-card {
  position: absolute;
  inset: 0;
  aspect-ratio: var(--card-ratio);
  height: 100%;
  transform: rotateY(180deg) translateX(-100%);
}
</style>
