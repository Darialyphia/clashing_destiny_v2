<script setup lang="ts">
import {
  useGameClient,
  useGameState,
  useGameUi,
  useMyPlayer,
  useOpponentPlayer
} from '../composables/useGameClient';
import PlayedCard from './PlayedCard.vue';
import ChooseCardModal from './ChooseCardModal.vue';
import { useGameKeyboardControls } from '../composables/useGameKeyboardControls';
import GameErrorModal from './GameErrorModal.vue';
import AnswerQuestionModal from './AnswerQuestionModal.vue';
import GameMenu from './GameMenu.vue';
import Camera from './Camera.vue';
import Hand from './Hand.vue';
import DraggedCard from './DraggedCard.vue';
import { useKeyboardControl } from '@/shared/composables/useKeyboardControl';
import { useSettingsStore } from '@/shared/composables/useSettings';
import { useEventListener, usePageLeave } from '@vueuse/core';
import { INTERACTION_STATES } from '@game/engine/src/game/game.enums';
import HoveredCardInfos from './HoveredCardnfos.vue';
import PlayerInfos from './PlayerInfos.vue';
import CombatArrows from './CombatArrows.vue';
import TurnIndicator from './TurnIndicator.vue';
import RearrangeCardsModal from './RearrangeCardsModal.vue';
import InteractionCard from './InteractionCard.vue';
import GameBoard from './GameBoard.vue';
import OpponentHand from './OpponentHand.vue';
import ScoringArrow from './ScoringArrow.vue';
import InteractionArrows from './InteractionArrows.vue';
import type { PlayerClockState } from '../composables/useGameSocket';
import PlayerResources from './PlayerResources.vue';
import Deck from './Deck.vue';

const { clocks } = defineProps<{
  clocks?: Record<string, PlayerClockState>;
  options: {
    teachingMode: boolean;
  };
}>();

const ui = useGameUi();
const { playerId, client } = useGameClient();
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

const isDev = import.meta.env.DEV;
</script>

<template>
  <div v-if="isDev" class="debug">
    <div>You are: {{ playerId }}</div>
    <div>Active players: {{ client.getActivePlayerIds().join(', ') }}</div>
    <div>Game Phase: {{ state.phase.state }}</div>
    <div>Selected Card: {{ ui.selectedCard?.id }}</div>
    <div>Interaction State: {{ state.interaction.state }}</div>
    <div>Hovered card id hand: {{ ui.hoveredCardInHand?.id }}</div>
  </div>

  <div class="game-board-container">
    <PlayedCard />
    <ChooseCardModal />
    <CombatArrows />
    <ScoringArrow />
    <InteractionArrows />
    <AnswerQuestionModal />
    <RearrangeCardsModal />
    <Camera>
      <GameBoard :clocks="clocks" />
    </Camera>
    <DraggedCard />

    <div class="my-deck">
      <Deck
        :size="myPlayer.remainingCardsInMainDeck"
        :offset="{ x: -0.25, y: -0.5, z: 0.5 }"
      />
    </div>
    <div class="opponent-deck">
      <Deck
        :size="opponent.remainingCardsInMainDeck"
        :offset="{ x: -0.25, y: -0.5, z: 0.25 }"
      />
    </div>
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

  <PlayerResources class="my-resources" :player="myPlayer" />
  <PlayerResources class="opponent-resources" :player="opponent" />

  <PlayerInfos class="opponent-player" :player="opponent" inverted />
  <PlayerInfos class="my-player" :player="myPlayer" />

  <GameMenu>
    <template #menu>
      <slot name="menu" />
    </template>
  </GameMenu>
  <TurnIndicator />

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
  left: var(--size-13);
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
  bottom: 185px;
  left: 0;
}

.opponent-hand {
  position: fixed;
  width: 100%;
  top: 3%;
  left: 0;
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
  left: var(--size-6);
  bottom: var(--size-3);
}
.my-resources {
  position: absolute;
  right: 140px;
  top: 50.5%;
  width: 200px;
}

.opponent-player {
  position: absolute;
  right: var(--size-6);
  top: var(--size-3);
}

.opponent-resources {
  position: absolute;
  right: 140px;
  top: 43%;
  width: 200px;
}

.hovered-cell-infos {
  position: absolute;
  right: var(--size-1);
  top: 45%;
  translate: 0 -50%;
  z-index: 2;
}

.my-deck {
  --pixel-scale: 1.25;
  perspective: 1500px;
  perspective-origin: -2000px 2000px;
  position: absolute;
  right: var(--size-10);
  bottom: -20px;
  transform-style: preserve-3d;
  rotate: -30deg;

  > * > * {
    border-bottom: #73473a 1px solid;
    border-left: #af7d48 1px solid;
  }
}
.opponent-deck {
  --pixel-scale: 1.25;
  perspective: 1500px;
  perspective-origin: 3000px 2000px;
  position: absolute;
  right: var(--size-10);
  top: -20px;
  transform-style: preserve-3d;
  rotate: 30deg;

  > * > * {
    border-right: #73473a 1px solid;
    border-bottom: #af7d48 1px solid;
  }
}
</style>
