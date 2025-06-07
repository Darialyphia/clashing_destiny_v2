<script setup lang="ts">
import CardBack from '@/card/components/CardBack.vue';
import { useBoardSide, useGameClient } from '../composables/useGameClient';
import InspectableCard from '@/card/components/InspectableCard.vue';
import { useResizeObserver } from '@vueuse/core';
import { throttle } from 'lodash-es';

const { playerId } = defineProps<{ playerId: string }>();

const boardSide = useBoardSide(playerId);

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
  console.log('cardSpacing', cardSpacing.value);
};

watch(
  [root, computed(() => boardSide.value.destinyZone.length)],
  () => {
    nextTick(computeSpacing);
  },
  { immediate: true }
);

useResizeObserver(root, throttle(computeSpacing, 50));
</script>

<template>
  <div class="destiny-zone" ref="root">
    <div v-for="card in boardSide.destinyZone" :key="card">
      <template v-if="client.playerId === playerId">
        <InspectableCard :card-id="card" side="top">
          <CardBack :key="card" class="item" />
        </InspectableCard>
      </template>
      <CardBack v-else class="item" />
    </div>
  </div>
</template>

<style scoped lang="postcss">
.destiny-zone {
  display: flex;
  border: solid 1px white;
  & > *:not(:last-child) {
    margin-right: calc(1px * v-bind(cardSpacing));
  }
}

.item {
  aspect-ratio: var(--card-ratio);
  height: 100%;
}
</style>
