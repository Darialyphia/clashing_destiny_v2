<script setup lang="ts">
import { useFullscreen, useWindowSize } from '@vueuse/core';
import {
  useGameState,
  useMyBoard,
  useOpponentBoard
} from '../composables/useGameClient';
import { useBoardResize } from '../composables/useBoardResize';
import Hand from '@/card/components/Hand.vue';
import ManaCostModal from './ManaCostModal.vue';
import DestinyPhaseModal from './DestinyPhaseModal.vue';
import AffinityModal from './AffinityModal.vue';
import BoardSide from './BoardSide.vue';
import Debug from './Debug.vue';
import ActionsButtons from './ActionsButtons.vue';
import ExplainerMessage from './ExplainerMessage.vue';
import GamePhaseTracker from './GamePhaseTracker.vue';
import CombatArrow from './CombatArrow.vue';
import ChooseCardModal from './ChooseCardModal.vue';

const board = useTemplateRef('board');
useBoardResize(board);
const { isFullscreen } = useFullscreen(document.body);
const myBoard = useMyBoard();
const opponentBoard = useOpponentBoard();
</script>

<template>
  <ManaCostModal />
  <DestinyPhaseModal />
  <AffinityModal />
  <ChooseCardModal />
  <CombatArrow />
  <div class="board-container">
    <Debug />

    <section
      class="board"
      :class="{ 'full-screen': isFullscreen }"
      :style="{ '--board-scale': 1 }"
      ref="board"
    >
      <BoardSide :player="opponentBoard.playerId" class="opponent-side" />
      <div class="middle-row">
        <GamePhaseTracker />
        <ExplainerMessage />
      </div>
      <BoardSide :player="myBoard.playerId" class="my-side" />
    </section>
    <Hand />
    <ActionsButtons />
  </div>
</template>

<style scoped lang="postcss">
.board-container {
  margin: 0;
  height: 100dvh;
  overflow: hidden;
  transform-style: preserve-3d;
  perspective: 1000px;
}

.card-turned {
  aspect-ratio: var(--card-ratio-inverted);
  position: relative;
}

.debug {
  > * {
    border: solid 2px white;
  }
}

.board {
  --board-scale: 1;
  --board-height: 95dvh;
  display: grid;
  grid-template-rows: 1fr auto 1fr;
  min-height: var(--board-height);
  row-gap: var(--size-5);
  transform: rotateX(30deg) translateY(-250px) scale(var(--board-scale));
  transform-style: preserve-3d;
  position: relative;
  margin-inline: auto;
}

:global(.board *) {
  transform-style: preserve-3d;
}

.middle-row {
  font-size: var(--font-size-4);
  display: flex;
  gap: var(--size-3);
  align-items: center;
}

.opponent-side {
  transform: rotateZ(180deg);
}
</style>
