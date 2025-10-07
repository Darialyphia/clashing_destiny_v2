<script setup lang="ts">
import { useGameUi, useOpponentBoard } from '@/game/composables/useGameClient';
import { clamp } from '@game/shared';
import { useResizeObserver } from '@vueuse/core';
import CardBack from '@/card/components/CardBack.vue';
import CountChip from './CountChip.vue';

const opponentBoard = useOpponentBoard();
const ui = useGameUi();

const handContainer = useTemplateRef('hand');
const handContainerSize = ref({ w: 0, h: 0 });

useResizeObserver(handContainer, () => {
  const el = handContainer.value;
  if (!el) return;
  const rect = el.getBoundingClientRect();
  handContainerSize.value = { w: rect.width, h: rect.height };
});

const pixelScale = computed(() => {
  let el = handContainer.value;
  if (!el) return 1;
  let scale = getComputedStyle(el).getPropertyValue('--pixel-scale');
  while (!scale) {
    if (!el.parentElement) return 1;
    el = el.parentElement;
    scale = getComputedStyle(el).getPropertyValue('--pixel-scale');
  }

  return parseInt(scale) || 1;
});

const cardW = computed(() => {
  return (
    parseInt(
      getComputedStyle(document.documentElement).getPropertyValue(
        '--card-width-unitless'
      )
    ) * pixelScale.value
  );
});

const handSize = computed(() => opponentBoard.value.hand.length);

const step = computed(() => {
  if (handSize.value <= 1) return 0;
  const natural =
    (handContainerSize.value.w - cardW.value) / (handSize.value - 1);
  return clamp(natural, 0, cardW.value);
});

const cards = computed(() => {
  if (handSize.value === 0) return [];
  const usedSpan = cardW.value + (handSize.value - 1) * step.value;
  const offset = (handContainerSize.value.w - usedSpan) / 2;

  return opponentBoard.value.hand.map((cardId, i) => ({
    x: offset + i * step.value,
    z: i
  }));
});
</script>

<template>
  <section
    :id="`hand-${opponentBoard.playerId}`"
    class="opponent-hand"
    :class="{
      'ui-hidden': !ui.displayedElements.hand
    }"
    :style="{ '--hand-size': opponentBoard.hand.length }"
    ref="hand"
  >
    <div
      class="hand-card"
      v-for="(card, index) in cards"
      :key="index"
      :style="{
        '--x': `${card.x}px`,
        '--z': card.z
      }"
    >
      <CardBack />
    </div>
    <CountChip
      :count="opponentBoard.hand.length"
      class="absolute top-0 left-0 z-12"
    />
  </section>
</template>

<style scoped lang="postcss">
.opponent-hand {
  --pixel-scale: 2;
  z-index: 1;
  position: relative;
}

.hand-card {
  position: absolute;
  right: 0;
  top: 0;
  transform-origin: 50% 100%;
  transform: translateX(calc(-1 * var(--x)));
  z-index: var(--z);
  transition: transform 0.2s var(--ease-2);
  pointer-events: auto;
}
</style>
