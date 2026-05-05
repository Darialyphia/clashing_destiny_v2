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
import LevelUpModal from './LevelUpModal.vue';
import { useGameKeyboardControls } from '../composables/useGameKeyboardControls';
import GameErrorModal from './GameErrorModal.vue';
import AnswerQuestionModal from './AnswerQuestionModal.vue';
import UiModal from '@/ui/components/UiModal.vue';
import FancyButton from '@/ui/components/FancyButton.vue';
import Camera from './Camera.vue';
import Hand from './Hand.vue';
import DraggedCard from './DraggedCard.vue';
import { useKeyboardControl } from '@/shared/composables/useKeyboardControl';
import { useSettingsStore } from '@/shared/composables/useSettings';
import { config } from '@/utils/config';
import { useEventListener, usePageLeave, useWindowSize } from '@vueuse/core';
import { INTERACTION_STATES } from '@game/engine/src/game/game.enums';
import PassButton from './PassButton.vue';
import PlayerInfos from './PlayerInfos.vue';
import HoveredCardInfos from './HoveredCardnfos.vue';
import { provideRichTextContext } from '../composables/useRichText';
import type { JobId } from '@game/engine/src/card/card.enums';
import BoardSpace from './BoardSpace.vue';
import { GAME_PHASES } from '@game/engine/src/game/game.enums';
import GamePhaseIndicator from './GamePhaseIndicator.vue';

const { clocks } = defineProps<{
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
const { playerId } = useGameClient();
const state = useGameState();
const myPlayer = useMyPlayer();
const opponent = useOpponentPlayer();
// const board = useTemplateRef('board');
// useBoardResize(board);

provideRichTextContext({
  heroLevel: computed(() => myPlayer.value.level),
  heroJobs: computed(() => {
    return (
      myPlayer.value.hero?.jobs.map(j => j.toLocaleUpperCase() as JobId) ?? []
    );
  })
});
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
  return ui.value.reset();
};

watch(isOutOfScreen, out => {
  if (!out) return;
  resetUiState();
});

useEventListener('mouseup', e => {
  if (e.button !== 0) return; // only triggers on left click
  resetUiState();
});

useEventListener('contextmenu', async e => {
  const actionTaken = await resetUiState();
  if (actionTaken) {
    e.preventDefault();
  }
});
</script>

<template>
  <div class="debug">
    <div>You are: {{ playerId }}</div>
    <div>Game Phase: {{ state.phase.state }}</div>
    <div>Selected Card: {{ ui.selectedCard?.id }}</div>
    <div>Interaction State: {{ state.interaction.state }}</div>
  </div>
  <div class="game-board-container">
    <SVGFilters />
    <PlayedCard />
    <ChooseCardModal />
    <LevelUpModal />
    <!-- <CombatArrows /> -->
    <AnswerQuestionModal />
    <Camera>
      <div class="board" :id="ui.DOMSelectors.board.id">
        <div class="minions-zone">
          <div class="opponent-base">
            <BoardSpace
              v-for="space in opponent.boardSide.base.toReversed()"
              :key="space"
              :cell-id="space"
            />
          </div>
          <div class="opponent-battlefield">
            <BoardSpace
              v-for="space in opponent.boardSide.battlefield.toReversed()"
              :key="space"
              :cell-id="space"
            />
          </div>
          <div class="my-battlefield">
            <BoardSpace
              v-for="space in myPlayer.boardSide.battlefield"
              :key="space"
              :cell-id="space"
            />
          </div>
          <div class="my-base">
            <BoardSpace
              v-for="space in myPlayer.boardSide.base"
              :key="space"
              :cell-id="space"
            />
          </div>
          <!-- <MinionRow :row="opponent.boardSide.base" class="opponent-back-row" />
          <MinionRow
            :row="opponent.boardSide.battlefield"
            class="opponent-front-row"
          />
          <div class="separator" />
          <MinionRow
            :row="myPlayer.boardSide.battlefield"
            class="my-front-row"
          />
          <MinionRow :row="myPlayer.boardSide.base" class="my-back-row" /> -->
          <div class="right-side">
            <PassButton />
            <div class="flex gap-2">
              <div
                v-for="(clock, userId) of clocks"
                :key="userId"
                class="action-clock"
                :class="{
                  active: clock.isActive,
                  warning: clock.remaining < 15
                }"
                :style="{ '--max': clock.max, '--remaining': clock.remaining }"
                :data-count="clock.remaining"
              ></div>
            </div>

            <div
              class="phase level-up"
              :class="state.phase.state === GAME_PHASES.LEVEL_UP && 'active'"
            />
            <div
              class="phase main"
              :class="state.phase.state === GAME_PHASES.MAIN && 'active'"
            />
            <div
              class="phase combat"
              :class="state.phase.state === GAME_PHASES.COMBAT && 'active'"
            />
          </div>
        </div>

        <div id="card-actions-portal"></div>
        <div class="arrows" id="arrows" />
      </div>
    </Camera>
    <DraggedCard />
  </div>

  <HoveredCardInfos class="hovered-cell-infos" />
  <PlayerInfos class="my-player-infos" :player="myPlayer" />
  <PlayerInfos class="opponent-player-infos" :player="opponent" />

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

  <GamePhaseIndicator />

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
  right: var(--size-12);
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
  width: 100%;
  /* width: var(--board-width);
  height: var(--board-height); */
  background: url(@/assets/backgrounds/battle-background.png);
  background-repeat: no-repeat;
  /* transform: scale(v-bind('boardScale'))
    translateX(calc(v-bind('boardMargin.x') * 1px))
    translateY(calc(v-bind('boardMargin.y') * 1px)); */
  --offset-y: calc(v-bind('boardMargin.y') * 1px);
  /* background-position: center calc(var(--offset-y) * -0.5); */
  transform: translateY(var(--offset-y));
}

.minions-zone {
  width: 912px;
  height: 621px;
  background: url(@/assets/ui/board.png);
  margin-top: 196px;
  margin-inline: auto;
  padding-block: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative;

  > div:not(.right-side) {
    height: 130px;
    margin-inline: 22px;
    width: calc(100% - 44px);
    display: flex;
    justify-content: space-between;
  }
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

/* @keyframes warning-pulse {
  0%,
  100% {
    color: white;
  }
  50% {
    color: red;
  }
} */

.action-clock {
  --color: #ffb270;
  aspect-ratio: 1;
  border: 2px solid #985e25;
  border-radius: 50%;
  position: relative;
  height: 80px;
  aspect-ratio: 1;
  --colored-angle: calc(360deg * (var(--remaining) / var(--max)));
  --transparent-angle: calc(360deg - var(--colored-angle));
  background: conic-gradient(
    transparent 0deg,
    transparent var(--transparent-angle),
    var(--color) calc(360deg * (var(--remaining) / var(--max))),
    var(--color) 360deg
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
    font-size: var(--font-size-5);
    color: var(--color);
    font-weight: var(--font-weight-5);
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

.opponent-base {
  position: absolute;
  padding-inline: 40px;
}

.opponent-battlefield {
  position: absolute;
  top: 165px;
}

.my-battlefield {
  position: absolute;
  top: 318px;
}

.my-base {
  position: absolute;
  top: 476px;
  padding-inline: 40px;
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
  left: var(--size-10);
  top: 45%;
  translate: 0 50%;
}

.opponent-player-infos {
  position: absolute;
  left: var(--size-10);
  top: 40%;
  translate: 0 -100%;
}

.hovered-cell-infos {
  position: absolute;
  right: var(--size-11);
  top: 45%;
  translate: 0 -50%;
  z-index: 2;
}

.right-side {
  position: absolute;
  left: 960px;
  top: 282px;

  .phase {
    width: 220px;
    height: 55px;

    &:not(.active) {
      filter: grayscale(100%) brightness(50%);
    }

    &.draw {
      background: url('@/assets/ui/phase-indicator-draw.png');
    }

    &.level-up {
      background: url('@/assets/ui/phase-indicator-level-up.png');
    }

    &.main {
      background: url('@/assets/ui/phase-indicator-main.png');
    }

    &.combat {
      background: url('@/assets/ui/phase-indicator-combat.png');
    }

    &.end {
      background: url('@/assets/ui/phase-indicator-end.png');
    }
  }
}
</style>
