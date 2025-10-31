<script setup lang="ts">
import {
  useMyBoard,
  useMyPlayer,
  useOpponentBoard,
  useOpponentPlayer
} from '../composables/useGameClient';
import Hand from '@/game/components/Hand.vue';
import Deck from './Deck.vue';

import ActionsButtons from './ActionsButtons.vue';
import DiscardPile from './DiscardPile.vue';
import DestinyZone from './DestinyZone.vue';
import DestinyDeck from './DestinyDeck.vue';
import EffectChain from './EffectChain.vue';
import BanishPile from './BanishPile.vue';
import BoardSlot from './BoardSlot.vue';
import OpponentHand from './OpponentHand.vue';
import EquipedArtifacts from './EquipedArtifacts.vue';
import HeroSlot from './HeroSlot.vue';
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
  <SVGFilters />
  <DestinyCostVFX />
  <ChooseCardModal />
  <AnswerQuestionModal />
  <PassConfirmationModal />
  <PlayedCard />
  <CombatArrows />

  <div class="board-perspective-wrapper">
    <div
      class="board"
      id="board"
      ref="board"
      :class="{ 'teaching-mode': options.teachingMode }"
    >
      <div class="my-infos">
        <span class="text-4 pl-2">{{ myPlayer.name }}</span>
        <div
          v-if="myClock"
          class="turn-clock"
          :class="{
            active: myClock.turn.isActive,
            warning: myClock.turn.remaining <= 10
          }"
          :data-count="myClock.turn.remaining"
          data-label="turn"
          :style="{
            '--max': myClock.turn.max,
            '--remaining': myClock.turn.remaining
          }"
        />
        <div
          v-if="myClock"
          class="action-clock"
          :class="{
            active: myClock.action.isActive,
            warning: myClock.action.remaining <= 10
          }"
          :data-count="myClock.action.remaining"
          data-label="action"
          :style="{
            '--max': myClock.action.max,
            '--remaining': myClock.action.remaining
          }"
        />
      </div>

      <div class="effect-chain pt-3">
        <EffectChain />
      </div>

      <div class="opponent-infos">
        <span class="text-4 pr-2">{{ opponentPlayer.name }}</span>

        <div
          v-if="opponentClock"
          class="turn-clock"
          :class="{
            active: opponentClock.turn.isActive,
            warning: opponentClock.turn.remaining <= 10
          }"
          :data-count="opponentClock.turn.remaining"
          data-label="turn"
          :style="{
            '--max': opponentClock.turn.max,
            '--remaining': opponentClock.turn.remaining
          }"
        />
        <div
          v-if="opponentClock"
          class="action-clock"
          :class="{
            active: opponentClock.action.isActive,
            warning: opponentClock.action.remaining <= 10
          }"
          :data-count="opponentClock.action.remaining"
          data-label="action"
          :style="{
            '--max': opponentClock.action.max,
            '--remaining': opponentClock.action.remaining
          }"
        />
      </div>

      <div class="cards-zone flex gap-3 justify-center">
        <div class="flex flex-col gap-3">
          <div class="flex-1 flex flex-col">
            <div class="text-center">Artifacts</div>
            <div class="artifacts">
              <EquipedArtifacts :player="myPlayer" />
            </div>
          </div>

          <div class="mb-4">
            <div class="card-container">
              <DestinyDeck :player-id="myPlayer.id" />
            </div>
            <div class="text-center">Destiny deck</div>
          </div>

          <div>
            <div class="card-container">
              <Deck :size="myPlayer.remainingCardsInMainDeck" />
            </div>
            <div class="text-center">Main deck</div>
          </div>
        </div>
        <div class="flex flex-col justify-center items-center">
          <div />
          <div class="hero-slot">
            {{ myPlayer.name }}
            <HeroSlot :player="myPlayer" />
          </div>

          <div class="flex gap-2 mt-auto">
            <div class="mt-auto">
              <div class="card-container">
                <DiscardPile :player="myPlayer.id" />
              </div>
              <div class="text-center">Discard pile</div>
            </div>
            <div>
              <div class="card-container">
                <BanishPile :player="myPlayer.id" />
              </div>
              <div class="text-center">Banish pile</div>
            </div>
          </div>
        </div>
      </div>

      <div class="minions-zone">
        <div class="flex gap-3 h-full">
          <div class="minion-row">
            <div>Back line</div>
            <BoardSlot
              v-for="slot in myBoard.backRow.slots"
              :key="slot.position"
              :boardSlot="slot"
            />
          </div>
          <div class="minion-row">
            <div>Front line</div>
            <BoardSlot
              v-for="slot in myBoard.frontRow.slots"
              :key="slot.position"
              :boardSlot="slot"
            />
          </div>
        </div>

        <div class="flex gap-3 h-full">
          <div class="minion-row">
            <div>Front line</div>

            <BoardSlot
              v-for="slot in opponentBoard.frontRow.slots"
              :key="slot.position"
              :boardSlot="slot"
            />
          </div>
          <div class="minion-row">
            <div>Back line</div>
            <BoardSlot
              v-for="slot in opponentBoard.backRow.slots"
              :key="slot.position"
              :boardSlot="slot"
            />
          </div>
        </div>
      </div>

      <div class="cards-zone flex gap-3 flex-row-reverse justify-center">
        <div class="flex flex-col gap-3">
          <div class="flex-1 flex flex-col">
            <div class="text-center">Artifacts</div>
            <div class="artifacts">
              <EquipedArtifacts :player="opponentPlayer" />
            </div>
          </div>
          <div>
            <div class="card-container">
              <DestinyDeck
                v-if="options.teachingMode"
                :player-id="opponentPlayer.id"
              />

              <Deck v-else :size="opponentPlayer.remainingCardsInDestinyDeck" />
            </div>
            <div class="text-center">Destiny deck</div>
          </div>
          <div>
            <div class="card-container">
              <Deck :size="opponentPlayer.remainingCardsInMainDeck" />
            </div>
            <div class="text-center">Main deck</div>
          </div>
        </div>
        <div class="flex flex-col items-center justify-center">
          <div class="hero-slot">
            {{ opponentPlayer.name }}
            <HeroSlot :player="opponentPlayer" />
          </div>

          <div class="flex gap-2 mt-auto">
            <div class="mt-auto">
              <div class="card-container">
                <BanishPile :player="opponentPlayer.id" />
              </div>
              <div class="text-center">Banish pile</div>
            </div>
            <div>
              <div class="card-container">
                <DiscardPile :player="opponentPlayer.id" />
              </div>
              <div class="text-center">Discard pile</div>
            </div>
          </div>
        </div>
      </div>

      <section class="p1-destiny flex gap-2 my-2">
        <span>Destiny</span>
        <div class="flex-1">
          <DestinyZone
            :player-id="myPlayer.id"
            :teaching-mode="options.teachingMode"
          />
        </div>
      </section>

      <!-- <section class="my-2">
        <ExplainerMessage />
      </section> -->

      <section class="p2-destiny flex gap-2 my-2">
        <div class="flex-1">
          <DestinyZone
            :player-id="opponentPlayer.id"
            :teaching-mode="options.teachingMode"
          />
        </div>
        <span>Destiny</span>
      </section>

      <ActionsButtons class="global-actions" />
      <!-- <BattleLog class="battle-log" /> -->
      <Hand
        v-if="options.teachingMode"
        class="opponent-hand"
        :key="opponentPlayer.id"
        :player-id="opponentPlayer.id"
      />
      <OpponentHand v-else class="opponent-hand" />
      <Hand class="my-hand" :player-id="myPlayer.id" :key="myPlayer.id" />

      <button
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
      <div class="arrows" id="arrows" />
    </div>
  </div>

  <GameErrorModal />
</template>

<style scoped lang="postcss">
.board-perspective-wrapper {
  perspective: 2500px;
  perspective-origin: center top;
  margin-inline: auto;
  background-size: cover;
  display: flex;
  justify-content: center;
  height: 100dvh;
}
.board {
  --pixel-scale: 1;
  background: url('/assets/backgrounds/board.png');
  background-size: cover;
  filter: brightness(1);
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  grid-template-rows: min-content min-content 1fr auto auto;
  row-gap: var(--size-0);
  column-gap: var(--size-2);
  scale: var(--board-scale, 1);
  transform-style: preserve-3d;
  transform-origin: top left;
  position: relative;
  font-family: 'Lato', sans-serif;
  font-size: var(--font-size-0);
  color: #985e25;
  padding-inline: var(--size-6);
  padding-block-start: var(--size-2);
  aspect-ratio: 16 / 9;
  overflow: hidden;
}

.effect-chain {
  grid-row: 1 / span 2;
  grid-column: 2;
}

.card-container {
  --padding: 2px;
  border: solid 1px #985e25;
  width: calc(var(--card-small-width) + var(--padding) * 2);
  height: calc(var(--card-small-height) + var(--padding) * 2);
}

.minions-zone {
  display: flex;
  justify-content: center;
  gap: var(--size-10);
}

.minion-row {
  display: flex;
  flex-direction: column;
  gap: var(--size-4);
  > *:nth-child(2) {
    margin-top: calc(-1 * var(--size-4));
  }
}

.artifacts {
  --padding: 2px;
  border: solid 1px #985e25;
  flex-grow: 1;
}

.my-hand {
  height: calc(var(--card-height) * 0.5 * 2);
  grid-column: 1 / -1;
  grid-row: 5;
}

.global-actions {
  grid-column: 2;
  grid-row: 4 / span 2;
  padding-bottom: var(--size-6);
}

.cards-zone {
  grid-row: 2 / span 2;
}
.opponent-hand {
  grid-column: 3;
  grid-row: 5;

  .teaching-mode & {
    height: calc(var(--card-height) * 0.5 * 2);
    grid-column: 1 / -1;
  }
}

.hero-slot {
  --pixel-scale: 2;
  width: calc(var(--card-width) * 2);
  height: calc(var(--card-height) * 2);
}

.p1-destiny,
.p2-destiny {
  > span {
    writing-mode: vertical-rl;
    text-orientation: upright;
  }
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

.my-infos {
  grid-row: 1;
  grid-column: 1;
  justify-self: start;
  align-items: center;
  display: flex;
  gap: var(--size-3);
  padding-left: var(--size-7);
  > span {
    color: #ffb270;
  }
}

.opponent-infos {
  grid-row: 1;
  grid-column: 3;
  justify-self: end;
  display: flex;
  flex-direction: row-reverse;
  align-items: center;
  gap: var(--size-3);
  padding-right: var(--size-7);
  > span {
    color: #ffb270;
  }
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
