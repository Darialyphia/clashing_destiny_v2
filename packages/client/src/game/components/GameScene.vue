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
import { useEventListener, usePageLeave } from '@vueuse/core';
import { INTERACTION_STATES } from '@game/engine/src/game/game.enums';

import PlayerInfos from './PlayerInfos.vue';
import HoveredCardInfos from './HoveredCardnfos.vue';
import BoardCard from './BoardCard.vue';
import CombatArrows from './CombatArrows.vue';
import TurnIndicator from './TurnIndicator.vue';
import RearrangeCardsModal from './RearrangeCardsModal.vue';
import InteractionCard from './InteractionCard.vue';
import GameBoard from './GameBoard.vue';
import OpponentHand from './OpponentHand.vue';

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
      <GameBoard :clocks="clocks" />
    </Camera>
    <DraggedCard />
  </div>

  <HoveredCardInfos class="hovered-cell-infos" />
  <InteractionCard />

  <Transition>
    <div class="vignette" v-if="isScreenDimmed" />
  </Transition>

  <div class="my-hand">
    <Hand :player-id="myPlayer.id" :key="myPlayer.id" />
  </div>

  <div class="opponent-hand">
    <OpponentHand
      :player-id="opponent.id"
      :teaching-mode="options.teachingMode"
    />
  </div>

  <div class="opponent-player">
    <PlayerInfos :player="opponent" />
    <div class="surface mr-8">
      <BoardCard
        v-if="opponent.hero"
        :card="opponent.hero"
        variant="default"
        :pixel-scale="0.5"
        @mouseenter="ui.hover(opponent.hero)"
        @mouseleave="ui.unhover()"
      />
    </div>
  </div>

  <div class="my-player">
    <div class="surface mr-8">
      <BoardCard
        v-if="myPlayer.hero"
        :card="myPlayer.hero"
        variant="default"
        :pixel-scale="0.5"
        @mouseenter="ui.hover(myPlayer.hero)"
        @mouseleave="ui.unhover()"
      />
    </div>
    <PlayerInfos :player="myPlayer" />
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

.my-hand {
  position: fixed;
  width: 100%;
  bottom: 195px;
  left: 0;
}

.opponent-hand {
  position: fixed;
  width: 100%;
  top: 6%;
  left: 0;
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

.vignette {
  position: fixed;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(
    ellipse at center,
    rgba(0, 0, 0, 0) 45%,
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
  left: 0;
  bottom: 55px;
  display: flex;
  gap: var(--size-2);
  flex-direction: column;
  align-items: center;
}

.opponent-player {
  position: absolute;
  left: 0;
  top: 55px;
  display: flex;
  flex-direction: column;
  gap: var(--size-2);
  align-items: center;
}

.hovered-cell-infos {
  position: absolute;
  right: var(--size-1);
  top: 45%;
  translate: 0 -50%;
  z-index: 2;
}
</style>
