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
import GamePhaseIndicator from './GamePhaseIndicator.vue';
import Debug from './Debug.vue';

const { clocks } = defineProps<{
  clocks?: Record<string, PlayerClockState>;
  options: {
    teachingMode: boolean;
  };
}>();

const ui = useGameUi();
const { client } = useGameClient();
const state = useGameState();
const myPlayer = useMyPlayer();
const opponent = useOpponentPlayer();
// const board = useTemplateRef('board');
// useBoardResize(board);

useGameKeyboardControls();
// const myClock = computed(() => clocks?.[myPlayer.value.id]);
// const opponentClock = computed(() => clocks?.[opponentPlayer.value.id]);

const isOutOfScreen = usePageLeave();

const resetUiState = async () => {
  await nextTick();
  const actionTaken = ui.value.reset();
  if (actionTaken) {
    client.value.optimisticStateManager.cancelPlayingCard();
  }
  return actionTaken;
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
  <Debug />
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
      :is-revealed="options.teachingMode"
      :player-id="opponent.id"
    />
  </div>

  <PlayerResources class="my-resources" :player="myPlayer" />
  <PlayerResources class="opponent-resources" :player="opponent" />

  <PlayerInfos class="opponent-player" :player="opponent" inverted />
  <PlayerInfos class="my-player" :player="myPlayer" />

  <DraggedCard />

  <GameMenu>
    <template #menu>
      <slot name="menu" />
    </template>
  </GameMenu>
  <TurnIndicator />
  <GamePhaseIndicator />

  <slot name="board-additional" />

  <GameErrorModal />
</template>

<style scoped lang="postcss">
:global(body:has(.game-board-container)) {
  overflow: hidden;
}

.game-board-container {
  width: 100vw;
  height: 100dvh;
  background-size: cover;
  overflow: hidden;
  position: relative;
  transform-style: preserve-3d;
  perspective: 1500px;
  background: black;
}

.my-hand {
  position: fixed;
  width: 100%;
  bottom: 185px;
  left: 0;

  @screen lt-lg {
    bottom: 90px;
  }
}

.opponent-hand {
  position: fixed;
  width: 100%;
  top: 0%;
  left: 0;
  @media (max-height: 920px) {
    top: -5%;
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

  @screen lt-lg {
    scale: 0.5;
    right: -40px;
    bottom: -100px;
  }

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

  @screen lt-lg {
    scale: 0.5;
    right: -40px;
    top: -100px;
  }

  > * > * {
    border-right: #73473a 1px solid;
    border-bottom: #af7d48 1px solid;
  }
}
</style>
