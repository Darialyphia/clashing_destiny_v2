<script setup lang="ts">
import {
  useGameClient,
  useGameState,
  useGameUi,
  useMyPlayer,
  useOpponentPlayer
} from '../composables/useGameClient';
import PlayedCard from './PlayedCard.vue';
import SVGFilters from './SVGFilters.vue';
import ChooseCardModal from './ChooseCardModal.vue';
import { useGameKeyboardControls } from '../composables/useGameKeyboardControls';
import GameErrorModal from './GameErrorModal.vue';
import AnswerQuestionModal from './AnswerQuestionModal.vue';
import UiModal from '@/ui/components/UiModal.vue';
import FancyButton from '@/ui/components/FancyButton.vue';
import Camera from './Camera.vue';
import Hand from './Hand.vue';
import DraggedCard from './DraggedCard.vue';
import TurnIndicator from './TurnIndicator.vue';
import { useKeyboardControl } from '@/shared/composables/useKeyboardControl';
import { useSettingsStore } from '@/shared/composables/useSettings';
import { config } from '@/utils/config';
import { useEventListener, usePageLeave, useWindowSize } from '@vueuse/core';
import { GAME_PHASES } from '@game/engine/src/game/game.enums';
import MinionRow from './MinionRow.vue';
import { INTERACTION_STATES } from '@game/engine/src/game/game.enums';
import PassButton from './PassButton.vue';
import MyPlayerInfos from './MyPlayerInfos.vue';
import OpponentPlayerInfos from './OpponentPlayerInfos.vue';
import HoveredCellInfos from './HoveredCellInfos.vue';
import MyHeroZone from './MyHeroZone.vue';
import OpponentHeroZone from './OpponentHeroZone.vue';

const { options } = defineProps<{
  clocks?: {
    [playerId: string]: {
      max: number;
      remaining: number;
      isActive: boolean;
    };
  };
  options: {
    teachingMode: boolean;
  };
}>();

const ui = useGameUi();
const state = useGameState();
const { playerId } = useGameClient();
const myPlayer = useMyPlayer();
const opponent = useOpponentPlayer();
// const board = useTemplateRef('board');
// useBoardResize(board);

useGameKeyboardControls();
// const myClock = computed(() => clocks?.[myPlayer.value.id]);
// const opponentClock = computed(() => clocks?.[opponentPlayer.value.id]);

const isGameSettingsOpened = ref(false);
const settings = useSettingsStore();

useKeyboardControl(
  'keydown',
  settings.settings.bindings.openSettings.control,
  () => {
    isGameSettingsOpened.value = !isGameSettingsOpened.value;
  }
);

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

const isOutOfScreen = usePageLeave();

const resetUiState = async () => {
  await nextTick();
  if (
    state.value.phase.state === GAME_PHASES.MAIN &&
    state.value.interaction.state === INTERACTION_STATES.IDLE
  ) {
    ui.value.unselectUnit();
  }
  if (!ui.value.draggedCard) return;
  const card = ui.value.draggedCard;

  ui.value.draggedCard = null;

  if (state.value.phase.state !== GAME_PHASES.PLAYING_CARD) return;

  ui.value.unselectCard();
  card.cancelPlay();
};

watch(isOutOfScreen, out => {
  if (!out) return;
  resetUiState();
});

useEventListener('mouseup', resetUiState);
</script>

<template>
  <div class="debug">
    <div>You are: {{ playerId }}</div>
    <div>Game Phase: {{ state.phase.state }}</div>
    <div>Interaction State: {{ state.interaction.state }}</div>
    <div>
      Interaction Context:
      <pre>{{ state.interaction.ctx }}</pre>
    </div>
  </div>
  <div class="game-board-container">
    <SVGFilters />
    <PlayedCard />
    <ChooseCardModal />
    <!-- <CombatArrows /> -->
    <AnswerQuestionModal />
    <Camera>
      <div class="board" :id="ui.DOMSelectors.board.id">
        <div class="minions-zone">
          <MinionRow :row="opponent.backRow" class="opponent-back-row" />
          <MinionRow :row="opponent.frontRow" class="opponent-front-row" />
          <div class="separator" />
          <MinionRow :row="myPlayer.frontRow" class="my-front-row" />
          <MinionRow :row="myPlayer.backRow" class="my-back-row" />
          <PassButton />
        </div>
        <OpponentHeroZone class="opponent-hero-zone" />
        <MyHeroZone class="my-hero-zone" />

        <div id="card-actions-portal"></div>
        <div class="arrows" id="arrows" />
      </div>
    </Camera>
    <DraggedCard />
  </div>

  <HoveredCellInfos class="hovered-cell-infos" />
  <MyPlayerInfos class="my-player-infos" />
  <OpponentPlayerInfos class="opponent-player-infos" />

  <Transition>
    <div
      class="vignette"
      v-if="state.interaction.state !== INTERACTION_STATES.IDLE"
    />
  </Transition>

  <div class="my-hand">
    <Hand :player-id="myPlayer.id" :key="myPlayer.id" />
  </div>

  <button
    aria-label="Settings"
    class="settings-button"
    @click="isGameSettingsOpened = true"
  />

  <TurnIndicator />

  <UiModal
    v-model:is-opened="isGameSettingsOpened"
    title="Menu"
    description="Game settings"
    :style="{ '--ui-modal-size': 'var(--size-xs)' }"
  >
    <div class="game-board-menu">
      <FancyButton text="Close" @click="isGameSettingsOpened = false" />
      <slot name="menu" />
    </div>
  </UiModal>
  <slot name="board-additional" />

  <GameErrorModal />
</template>

<style scoped lang="postcss">
:global(body:has(.game-board-container)) {
  overflow: hidden;
}
.debug {
  position: fixed;
  top: 0;
  left: var(--size-12);
  color: white;
  font-size: var(--font-size-0);
  z-index: 10;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  padding: var(--size-4);
  max-width: var(--size-xs);
}
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
  margin-inline: auto;
  grid-template-rows: 1fr auto 1fr auto;
  transform-style: preserve-3d;
  transform-origin: top left;
  width: var(--board-width);
  height: var(--board-height);
  background: url(@/assets/backgrounds/battle-background.png);
  /* transform: scale(v-bind('boardScale'))
    translateX(calc(v-bind('boardMargin.x') * 1px))
    translateY(calc(v-bind('boardMargin.y') * 1px)); */
  --offset-y: calc(v-bind('boardMargin.y') * 1px);
  /* background-position: center calc(var(--offset-y) * -0.5); */
  transform: translateY(var(--offset-y));
}

.minions-zone {
  width: 832px;
  height: 621px;
  background: url(@/assets/ui/board.png);
  margin-top: 196px;
  margin-inline: auto;
  padding-block: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative;
}

.arrows {
  transform: translateZ(10px);
}

.my-hand {
  position: fixed;
  width: 100%;
  bottom: 10%;
  left: 0;
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

.separator {
  height: 24px;
}
/* @keyframes warning-pulse {
  0%,
  100% {
    color: white;
  }
  50% {
    color: red;
  }
} */
/*
.action-clock {
  --color: #ffb270;
}

.turn-clock {
  --color: #79d2c0;
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
} */

.settings-button {
  --pixel-scale: 2;
  position: fixed;
  right: var(--size-8);
  bottom: var(--size-6);
  width: calc(32px * var(--pixel-scale));
  aspect-ratio: 1;
  background: url('@/assets/ui/settings-icon.png');
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

.opponent-back-row {
  position: absolute;
  left: 22px;
}

.opponent-front-row {
  position: absolute;
  left: 22px;
  top: 156px;
}

.my-front-row {
  position: absolute;
  left: 22px;
  top: 332px;
}

.my-back-row {
  position: absolute;
  left: 22px;
  top: 476px;
}

.vignette {
  position: fixed;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(
    ellipse at center,
    rgba(0, 0, 0, 0) 20%,
    rgba(0, 0, 0, 0.5) 90%
  );
  z-index: 1;

  &.v-enter-active,
  &.v-leave-active {
    transition: opacity 0.6s ease;
  }

  &.v-enter-from,
  &.v-leave-to {
    opacity: 0;
  }
}

.my-player-infos {
  position: absolute;
  left: var(--size-12);
  bottom: min(10%, var(--size-11));
}

.opponent-player-infos {
  position: absolute;
  right: var(--size-12);
  top: 5%;
}

.hovered-cell-infos {
  position: absolute;
  left: var(--size-11);
  top: 45%;
  translate: 0 -50%;
  z-index: 2;
}

.my-hero-zone {
  position: absolute;
  left: 50%;
  top: 890px;
  translate: -50% -50%;
}

.opponent-hero-zone {
  position: absolute;
  left: 50%;
  top: 120px;
  translate: -50% -50%;
}
</style>
