<script setup lang="ts">
import {
  useMyBoard,
  useMyPlayer,
  useOpponentBoard,
  useOpponentPlayer
} from '../composables/useGameClient';
import ActionsButtons from './ActionsButtons.vue';
import CombatArrows from './CombatArrows.vue';
import PlayedCard from './PlayedCard.vue';
import SVGFilters from './SVGFilters.vue';
import ChooseCardModal from './ChooseCardModal.vue';
import { useGameKeyboardControls } from '../composables/useGameKeyboardControls';
import GameErrorModal from './GameErrorModal.vue';
import DestinyCostVFX from './DestinyCostVFX.vue';
import AnswerQuestionModal from './AnswerQuestionModal.vue';
import PassConfirmationModal from './PassConfirmationModal.vue';
import UiModal from '@/ui/components/UiModal.vue';
import FancyButton from '@/ui/components/FancyButton.vue';
import Camera from './Camera.vue';
import MyBoard from './MyBoard.vue';
import OpponentBoard from './OpponentBoard.vue';
import EffectChain from './EffectChain.vue';

// import { useBoardResize } from '../composables/useBoardResize';

const { clocks, options } = defineProps<{
  clocks?: {
    [playerId: string]: {
      turn: { max: number; remaining: number; isActive: boolean };
      action: { max: number; remaining: number; isActive: boolean };
    };
  };
  options: {
    teachingMode: boolean;
  };
}>();

const myBoard = useMyBoard();
const myPlayer = useMyPlayer();
const opponentBoard = useOpponentBoard();
const opponentPlayer = useOpponentPlayer();

// const board = useTemplateRef('board');
// useBoardResize(board);

useGameKeyboardControls();
const myClock = computed(() => clocks?.[myPlayer.value.id]);
const opponentClock = computed(() => clocks?.[opponentPlayer.value.id]);

const isSettingsOpened = ref(false);
</script>

<template>
  <!-- <SVGFilters />
  <DestinyCostVFX />
  <ChooseCardModal />
  <AnswerQuestionModal />
  <PassConfirmationModal />
  <PlayedCard />
  <CombatArrows />

  <ActionsButtons class="global-actions" /> -->
  <div class="game-board-container">
    <Camera>
      <div class="board">
        <OpponentBoard />
        <EffectChain />
        <MyBoard />
      </div>
    </Camera>
  </div>
  <!-- <button
    aria-label="Settings"
    class="settings-button"
    @click="isSettingsOpened = true"
  />
  <UiModal
    v-model:is-opened="isSettingsOpened"
    title="Menu"
    description="Game settings"
    :style="{ '--ui-modal-size': 'var(--size-xs)' }"
  >
    <div class="game-board-menu">
      <FancyButton text="Close" @click="isSettingsOpened = false" />
      <slot name="menu" />
    </div>
  </UiModal>
  <slot name="board-additional" />
  <div class="arrows" id="arrows" /> -->

  <GameErrorModal />
</template>

<style scoped lang="postcss">
.game-board-container {
  width: 100vw;
  height: 100dvh;
  background-size: cover;
  overflow: hidden;
  position: relative;
  transform-style: preserve-3d;
  perspective: 1500px;
}

.board {
  display: grid;
  height: 100%;
  grid-template-rows: 1fr auto 1fr;
  gap: var(--size-2);
  transform-style: preserve-3d;
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

@keyframes warning-pulse {
  0%,
  100% {
    color: white;
  }
  50% {
    color: red;
  }
}
.action-clock,
.turn-clock {
  aspect-ratio: 1;
  border: 2px solid #985e25;
  border-radius: 50%;
  position: relative;
  height: 100%;
  aspect-ratio: 1;
  background: conic-gradient(
    var(--color) 0deg,
    var(--color) calc(360deg * (var(--remaining) / var(--max))),
    transparent calc(360deg * (var(--remaining) / var(--max))),
    transparent 360deg
  );

  &:not(.active) {
    opacity: 0.25;
  }
  &::before {
    content: attr(data-count);
    position: absolute;
    top: 50%;
    left: 50%;
    width: 75%;
    transform: translate(-50%, -50%);
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--font-size-4);
    color: #985e25;
    font-weight: var(--font-weight-9);
    background-color: black;
    border-radius: var(--radius-round);
  }

  &::after {
    content: attr(data-label);
    position: absolute;
    bottom: -0.5rem;
    left: 50%;
    transform: translateX(-50%);
    font-size: var(--font-size-00);
    font-weight: var(--font-weight-7);
    color: white;
    text-transform: uppercase;
    letter-spacing: 0.1ch;
    -webkit-text-stroke: 4px black;
    paint-order: stroke fill;
  }

  &.active.warning::after {
    animation: warning-pulse 1s infinite;
  }
}

.action-clock {
  --color: #ffb270;
}

.turn-clock {
  --color: #79d2c0;
}

.settings-button {
  --pixel-scale: 2;
  position: fixed;
  right: var(--size-8);
  bottom: var(--size-6);
  width: calc(32px * var(--pixel-scale));
  aspect-ratio: 1;
  background: url('/assets/ui/settings-icon.png');
  background-size: cover;
  z-index: 2;
  &:hover {
    filter: brightness(1.2);
  }
}

.game-board-menu {
  display: grid;
  gap: var(--size-2);
  > * {
    width: 100%;
  }
}
</style>
