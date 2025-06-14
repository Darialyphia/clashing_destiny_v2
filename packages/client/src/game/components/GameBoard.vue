<script setup lang="ts">
import { useFullscreen } from '@vueuse/core';
import { useMyBoard, useOpponentBoard } from '../composables/useGameClient';
import { useBoardResize } from '../composables/useBoardResize';
import Hand from '@/card/components/Hand.vue';
// import ManaCostModal from './ManaCostModal.vue';
import DestinyPhaseModal from './DestinyPhaseModal.vue';
import AffinityModal from './AffinityModal.vue';
import BoardSide from './BoardSide.vue';
import Debug from './Debug.vue';
import ActionsButtons from './ActionsButtons.vue';
import ExplainerMessage from './ExplainerMessage.vue';
import GamePhaseTracker from './GamePhaseTracker.vue';
import CombatArrows from './CombatArrows.vue';
import ChooseCardModal from './ChooseCardModal.vue';
import EffectChain from './EffectChain.vue';
import PlayerInfos from './PlayerInfos.vue';
import PlayedCard from './PlayedCard.vue';
import SVGFilters from './SVGFilters.vue';
import DestinyCostVFX from './DestinyCostVFX.vue';
import BattleLog from './BattleLog.vue';

const board = useTemplateRef('board');
useBoardResize(board);
const { isFullscreen } = useFullscreen(document.body);
const myBoard = useMyBoard();
const opponentBoard = useOpponentBoard();
</script>

<template>
  <!-- <ManaCostModal /> -->
  <BattleLog />
  <SVGFilters />
  <DestinyPhaseModal />
  <AffinityModal />
  <ChooseCardModal />
  <CombatArrows />
  <PlayedCard />
  <DestinyCostVFX />
  <div class="arrows" id="arrows" />

  <div class="board-container">
    <Debug />

    <PlayerInfos />
    <section
      id="board"
      class="board"
      :class="{ 'full-screen': isFullscreen }"
      :style="{ '--board-scale': 1 }"
      ref="board"
    >
      <BoardSide :player="opponentBoard.playerId" class="opponent-side" />
      <div class="middle-row">
        <GamePhaseTracker />
        <ExplainerMessage />
        <EffectChain />
      </div>
      <BoardSide :player="myBoard.playerId" class="my-side" />
    </section>
    <Hand />
    <ActionsButtons />
  </div>
</template>

<style scoped lang="postcss">
.board-container {
  margin: 0 auto;
  height: 100dvh;
  overflow: hidden;
  transform-style: preserve-3d;
  perspective: 1000px;
}

.board {
  --board-scale: 1;
  --board-height: 95dvh;
  display: grid;
  grid-template-rows: 1fr auto 1fr;
  min-height: var(--board-height);
  row-gap: var(--size-2);
  transform: rotateX(30deg) translateY(-275px) scale(var(--board-scale));
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
  transform: rotateZ(180deg) translateX(-6%);
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
</style>
