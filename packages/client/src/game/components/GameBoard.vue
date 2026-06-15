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
import { useKeyboardControl } from '@/shared/composables/useKeyboardControl';
import { useSettingsStore } from '@/shared/composables/useSettings';
import { config } from '@/utils/config';
import { useEventListener, usePageLeave, useWindowSize } from '@vueuse/core';
import { INTERACTION_STATES } from '@game/engine/src/game/game.enums';
import PassButton from './PassButton.vue';
import PlayerInfos from './PlayerInfos.vue';
import HoveredCardInfos from './HoveredCardnfos.vue';
import BoardSpace from './BoardSpace.vue';
import BoardCard from './BoardCard.vue';
import EffectChain from './EffectChain.vue';
import CombatArrows from './CombatArrows.vue';
import MyHero from './MyHero.vue';
import GameCard from './GameCard.vue';
import InspectableCard from '@/card/components/InspectableCard.vue';
import TurnIndicator from './TurnIndicator.vue';
import RearrangeCardsModal from './RearrangeCardsModal.vue';

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

const isScreenDimmed = computed(() => {
  if (state.value.interaction.state !== INTERACTION_STATES.IDLE) return true;
  if (state.value.effectChain?.state === 'BUILDING') return true;
  return false;
});
</script>

<template>
  <div class="debug">
    <div>You are: {{ playerId }}</div>
    <div>Game Phase: {{ state.phase.state }}</div>
    <div>Selected Card: {{ ui.selectedCard?.id }}</div>
    <div>Interaction State: {{ state.interaction.state }}</div>
    <div>Chain: {{ state.effectChain?.state }}</div>
  </div>
  <div class="game-board-container">
    <SVGFilters />
    <PlayedCard />
    <ChooseCardModal />
    <CombatArrows />
    <AnswerQuestionModal />
    <RearrangeCardsModal />
    <Camera>
      <div class="board" :id="ui.DOMSelectors.board.id">
        <div class="opponent-hero">
          <BoardCard
            v-if="opponent.hero"
            :card="opponent.hero"
            @mouseenter="ui.hover(opponent.hero)"
            @mouseleave="ui.unhover()"
          />
        </div>

        <div class="minions-zone">
          <div class="opponent-base zone">
            <BoardSpace
              v-for="space in opponent.base"
              :key="space.id"
              :cell-id="space.id"
            />
          </div>
          <div class="opponent-battlefields">
            <div class="zone">
              <InspectableCard
                v-if="opponent.leftBattlefield.destinyCard"
                :card-id="opponent.leftBattlefield.destinyCard.id"
              >
                <GameCard
                  class="opponent-left-destiny"
                  :card-id="opponent.leftBattlefield.destinyCard.id"
                  variant="small"
                  :is-interactive="false"
                />
              </InspectableCard>
              <BoardSpace
                v-for="space in opponent.leftBattlefield.spaces"
                :key="space.id"
                :cell-id="space.id"
              />
            </div>
            <div class="zone">
              <BoardSpace
                v-for="space in opponent.rightBattlefield.spaces"
                :key="space.id"
                :cell-id="space.id"
              />
              <InspectableCard
                v-if="opponent.rightBattlefield.destinyCard"
                :card-id="opponent.rightBattlefield.destinyCard.id"
              >
                <GameCard
                  class="opponent-right-destiny"
                  :card-id="opponent.rightBattlefield.destinyCard.id"
                  variant="small"
                  :is-interactive="false"
                />
              </InspectableCard>
            </div>
          </div>
          <div class="my-battlefields">
            <div class="zone">
              <InspectableCard
                v-if="myPlayer.leftBattlefield.destinyCard"
                :card-id="myPlayer.leftBattlefield.destinyCard.id"
              >
                <GameCard
                  class="my-left-destiny"
                  :card-id="myPlayer.leftBattlefield.destinyCard.id"
                  variant="small"
                  :is-interactive="false"
                />
              </InspectableCard>
              <BoardSpace
                v-for="space in myPlayer.leftBattlefield.spaces"
                :key="space.id"
                :cell-id="space.id"
              />
            </div>
            <div class="zone">
              <BoardSpace
                v-for="space in myPlayer.rightBattlefield.spaces"
                :key="space.id"
                :cell-id="space.id"
              />
              <InspectableCard
                v-if="myPlayer.rightBattlefield.destinyCard"
                :card-id="myPlayer.rightBattlefield.destinyCard.id"
              >
                <GameCard
                  class="my-right-destiny"
                  :card-id="myPlayer.rightBattlefield.destinyCard.id"
                  variant="small"
                  :is-interactive="false"
                />
              </InspectableCard>
            </div>
          </div>
          <div class="my-base zone">
            <BoardSpace
              v-for="space in myPlayer.base"
              :key="space.id"
              :cell-id="space.id"
            />
          </div>
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
            .
          </div>
        </div>

        <div class="my-hero">
          <MyHero />
          <EffectChain class="effect-chain" />
        </div>

        <div id="card-actions-portal" class="absolute"></div>
        <div class="arrows" id="arrows" />
      </div>
    </Camera>
    <DraggedCard />
  </div>

  <HoveredCardInfos class="hovered-cell-infos" />

  <div class="my-player">
    <PlayerInfos :player="myPlayer" />
  </div>
  <div class="opponent-player">
    <PlayerInfos :player="opponent" />
  </div>

  <Transition>
    <div class="vignette" v-if="isScreenDimmed" />
  </Transition>

  <div class="my-hand">
    <Hand :player-id="myPlayer.id" :key="myPlayer.id" />
  </div>

  <button
    aria-label="Settings"
    class="settings-button"
    @click="isGameSettingsOpened = true"
  />

  <!-- <GamePhaseIndicator /> -->
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
  background: url(@/assets/backgrounds/battle-background-hirez.png);
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  padding-bottom: 5dvh;
  /* transform: scale(v-bind('boardScale'))
    translateX(calc(v-bind('boardMargin.x') * 1px))
    translateY(calc(v-bind('boardMargin.y') * 1px)); */
  --offset-y: calc(v-bind('boardMargin.y') * 1px);
  /* background-position: center calc(var(--offset-y) * -0.5); */
  /* transform: translateY(var(--offset-y)); */
}

.minions-zone {
  width: 1200px;
  height: 621px;
  background: url(@/assets/ui/board.png);
  margin-inline: auto;
  margin-block-start: -10px;
  padding-block: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative;
  translate: 0 -8px;
  .zone {
    height: 130px;
    display: flex;
    justify-content: space-between;
  }
}

.opponent-left-destiny,
.my-left-destiny {
  position: absolute;
  top: 0;
  left: 0;
}

.opponent-left-destiny {
  translate: -125% -10%;
}

.my-left-destiny {
  translate: -125% 10%;
}

.opponent-right-destiny,
.my-right-destiny {
  position: absolute;
  top: 0;
  right: 0;
}

.opponent-right-destiny {
  translate: 125% -10%;
}

.my-right-destiny {
  translate: 125% 25%;
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
  width: 930px;
  left: 50%;
  translate: -50% 0;
}

.opponent-battlefields {
  position: absolute;
  top: 165px;
  display: flex;
  padding-inline: 22px;
  justify-content: space-between;
  width: 100%;

  .zone {
    width: 502px;
    padding-inline: 10px;
    position: relative;
  }
}

.my-battlefields {
  position: absolute;
  top: 318px;
  display: flex;
  padding-inline: 22px;
  justify-content: space-between;
  width: 100%;

  .zone {
    width: 502px;
    padding-inline: 10px;
    position: relative;
  }
}

.my-base {
  position: absolute;
  width: 930px;
  left: 50%;
  translate: -50% 0;
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

.my-player {
  position: absolute;
  left: var(--size-10);
  bottom: 20%;
  translate: 0 20%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.opponent-player {
  position: absolute;
  left: var(--size-10);
  top: 20%;
  translate: 0 -90%;
  display: flex;
  flex-direction: column;
  align-items: center;
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
  left: 1180px;
  top: 288px;
}

.my-hero {
  align-self: start;
  display: flex;
  gap: var(--size-4);
  width: 50%;
  translate: calc(50vw - (var(--card-small-width) / 2)) 0;
}

.opponent-hero {
  align-self: center;
  translate: 0 -20px;
}

.effect-chain {
  flex-grow: 1;
}
</style>
