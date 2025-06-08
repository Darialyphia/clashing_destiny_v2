<script setup lang="ts">
import { useFullscreen } from '@vueuse/core';
import {
  useGameClient,
  useGameState,
  useMyBoard,
  useOpponentBoard
} from '../composables/useGameClient';
import { useBoardResize } from '../composables/useBoardResize';
import Hand from '@/card/components/Hand.vue';
import ManaCostModal from './ManaCostModal.vue';
import FancyButton from '@/ui/components/FancyButton.vue';
import { GAME_PHASES } from '@game/engine/src/game/game.enums';
import DestinyPhaseModal from './DestinyPhaseModal.vue';
import AffinityModal from './AffinityModal.vue';
import BoardSide from './BoardSide.vue';
import Debug from './Debug.vue';
import ActionsButtons from './ActionsButtons.vue';

const client = useGameClient();
const state = useGameState();
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

  <div class="board-container">
    <Debug />
    <section
      class="board"
      :class="{ 'full-screen': isFullscreen }"
      :style="{ '--board-scale': 1 }"
      ref="board"
    >
      <BoardSide :player="opponentBoard.playerId" class="opponent-side" />
      <div class="explainer">
        <div
          class="phase"
          :class="{ active: state.phase.state === GAME_PHASES.DRAW }"
        >
          DRAW
        </div>
        <div
          class="phase"
          :class="{ active: state.phase.state === GAME_PHASES.DESTINY }"
        >
          DESTINY
        </div>
        <div
          class="phase"
          :class="{ active: state.phase.state === GAME_PHASES.MAIN }"
        >
          MAIN
        </div>
        <div
          class="phase"
          :class="{ active: state.phase.state === GAME_PHASES.ATTACK }"
        >
          COMBAT
        </div>
        <div
          class="phase"
          :class="{ active: state.phase.state === GAME_PHASES.END }"
        >
          END
        </div>
        <p class="ml-auto">TODO Current interaction explainer message</p>
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
    border: solid 1px white;
  }
}

.board {
  --board-scale: 1;
  --board-height: 90dvh;
  display: grid;
  grid-template-rows: 1fr auto 1fr;
  height: ar(--board-height);
  row-gap: var(--size-5);
  padding-inline: 20rem;
  transform: rotateX(30deg) translateY(-225px) scale(var(--board-scale));
  transform-style: preserve-3d;
  padding-inline: var(--size-12);
}

:global(.board *) {
  transform-style: preserve-3d;
}

.explainer {
  font-size: var(--font-size-4);
  display: flex;
  gap: var(--size-3);
  align-items: center;

  > p {
    transform: rotateX(-30deg);
    font-size: inherit;
  }
}
.phase {
  border: solid 2px white;
  border-radius: var(--radius-2);
  padding: var(--size-2) var(--size-3);
  font-size: var(--font-size-3);
  &.active {
    border-color: var(--cyan-4);
  }
}

.opponent-side {
  transform: rotateZ(180deg);
}
</style>
