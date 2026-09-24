<script setup lang="ts">
import { useGameUi } from '../composables/useGameClient';
import { useWindowSize } from '@vueuse/core';
import { config } from '@/utils/config';

const ui = useGameUi();

const { height } = useWindowSize();
const boardScale = computed(() => {
  return 1;
  // const scaleX = width.value / config.BOARD_SIZE.x;
  // const scaleY = height.value / config.BOARD_SIZE.y;
  // return Math.min(scaleX, scaleY);
});

const boardMargin = computed(() => {
  // const scaledBoardWidth = config.BOARD_SIZE.x * boardScale.value;
  const scaledBoardHeight = config.BOARD_SIZE.y * boardScale.value;
  return {
    // x: (width.value - scaledBoardWidth) / 2,
    x: 0,
    y: (height.value - scaledBoardHeight) / 2
  };
});
</script>

<template>
  <div class="board" :id="ui.DOMSelectors.board.id">
    <slot name="battlefield" />

    <div id="card-actions-portal" class="absolute"></div>
    <div class="arrows" id="arrows" />
  </div>
</template>

<style scoped lang="postcss">
.board {
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-inline: auto;
  transform-style: preserve-3d;
  transform-origin: top left;
  width: 100%;
  height: 100%;
  /* width: var(--board-width);
  height: var(--board-height); */
  background: url(@/assets/backgrounds/battle-background2.png);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  /* transform: scale(v-bind('boardScale'))
    translateX(calc(v-bind('boardMargin.x') * 1px))
    translateY(calc(v-bind('boardMargin.y') * 1px)); */
  --offset-y: calc(v-bind('boardMargin.y') * 1px);
  /* background-position: center calc(var(--offset-y) * -0.5); */
  /* transform: translateY(var(--offset-y)); */
}

.arrows {
  transform: translateZ(10px);
}

#arrows {
  position: fixed;
  z-index: 1;
  inset: 0;
  pointer-events: none;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;
}
:global(#arrows > *) {
  grid-column: 1;
  grid-row: 1;
}

#card-actions-portal {
  transform: translateZ(10px);
}
</style>
