<script setup lang="ts">
import CombatArrows from './CombatArrows.vue';
import ChooseCardModal from './ChooseCardModal.vue';
import PlayedCardIntent from './PlayedCardIntent.vue';
import SVGFilters from './SVGFilters.vue';
import DestinyCostVFX from './DestinyCostVFX.vue';
import BattleLog from './BattleLog.vue';
import Minionzone from './Minionzone.vue';
import GamePhaseTracker from './GamePhaseTracker.vue';
import {
  useGameClient,
  useGameState,
  useMyBoard,
  useMyPlayer,
  useOpponentBoard,
  useOpponentPlayer
} from '../composables/useGameClient';
import ActionsButtons from './ActionsButtons.vue';
import HeroSlot from './HeroSlot.vue';
import Hand from '@/game/components/Hand.vue';
import DestinyZone from './DestinyZone.vue';
import ExplainerMessage from './ExplainerMessage.vue';
import EffectChain from './EffectChain.vue';
import PlayerStats from './PlayerStats.vue';
import { useMouse } from '@vueuse/core';
import { mapRange } from '@game/shared';
import EquipedArtifacts from './EquipedArtifacts.vue';
import Deck from './Deck.vue';
import PlayedCard from './PlayedCard.vue';
import OpponentHand from './OpponentHand.vue';
import { useBoardResize } from '../composables/useBoardResize';

const state = useGameState();
const client = useGameClient();
const myBoard = useMyBoard();
const opponentBoard = useOpponentBoard();
const myPlayer = useMyPlayer();
const opponentPlayer = useOpponentPlayer();

const { x, y } = useMouse();
const angleZ = computed(() => {
  return mapRange(Math.round(x.value), [0, window.innerWidth], [-90, 90]);
});
const angleX = computed(() => {
  return mapRange(
    window.innerHeight - Math.round(y.value),
    [0, window.innerHeight],
    [-90, 90]
  );
});

const board = useTemplateRef('board');
// useBoardResize(board);
</script>

<template>
  <!-- <ManaCostModal /> -->
  <!-- <BattleLog />
  <SVGFilters /> -->
  <!-- <DestinyPhaseModal v-if="hasFinishedStartAnimation" /> -->
  <!-- <ChooseCardModal />
  <CombatArrows />
  <PlayedCardIntent />
  <PlayedCard />
  <DestinyCostVFX /> -->
  <!--
  <div class="explainer">
    <ExplainerMessage />
  </div> -->
  <div class="board-perspective-wrapper">
    <div class="board" id="board" ref="board">
      <div class="flex gap-3 justify-center">
        <div class="flex flex-col gap-3">
          <div class="card-container"></div>
          <div class="card-container mt-auto"></div>
          <div class="card-container"></div>
        </div>
        <div class="flex flex-col justify-center items-center">
          <div />
          <div class="hero-slot"></div>
          <div class="flex gap-2 mt-auto">
            <div class="card-container"></div>
            <div class="card-container"></div>
          </div>
        </div>
      </div>

      <div class="minions-zone">
        <div class="flex gap-3 h-full">
          <div class="minion-row">
            <div class="card-container"></div>
            <div class="card-container"></div>
            <div class="card-container"></div>
            <div class="card-container"></div>
          </div>
          <div class="minion-row">
            <div class="card-container"></div>
            <div class="card-container"></div>
            <div class="card-container"></div>
            <div class="card-container"></div>
          </div>
        </div>

        <div class="flex gap-3 h-full">
          <div class="minion-row">
            <div class="card-container"></div>
            <div class="card-container"></div>
            <div class="card-container"></div>
            <div class="card-container"></div>
          </div>
          <div class="minion-row">
            <div class="card-container"></div>
            <div class="card-container"></div>
            <div class="card-container"></div>
            <div class="card-container"></div>
          </div>
        </div>
      </div>

      <div class="flex gap-3 flex-row-reverse justify-center">
        <div class="flex flex-col gap-3">
          <div class="card-container"></div>
          <div class="card-container mt-auto"></div>
          <div class="card-container"></div>
        </div>
        <div class="flex flex-col items-center justify-center">
          <div class="hero-slot"></div>
          <div class="flex gap-2 mt-auto">
            <div class="card-container"></div>
            <div class="card-container"></div>
          </div>
        </div>
      </div>

      <section class="p1-destiny">
        <div class="destiny-zone"></div>
      </section>

      <section class="chain-visualizer"></section>

      <section class="p2-destiny">
        <div class="destiny-zone"></div>
      </section>

      <section class="bottom-row">
        <div class="p1-hand"></div>
        <div class="p2-hand"></div>
      </section>

      <!-- <section class="p1-zone">
      <article class="flex flex-col gap-1">
        <div class="flex gap-3 mb-2">
          <div class="avatar" />
          <div>
            <div>{{ myPlayer.name }}</div>
          </div>
        </div>
        <PlayerStats
          :player="myPlayer"
          :class="{ 'ui-hidden': !client.ui.displayedElements.playerInfos }"
        />
      </article>

      <DestinyZone :player-id="myPlayer.id" class="mt-auto" />
    </section> -->

      <!-- <section class="middle-zone" @animationend="finishStartAnimation">
      <Deck :player="myPlayer" class="p2-deck" />
      <Minionzone
        :player-id="opponentBoard.playerId"
        class="p2-minions"
        :id="client.ui.DOMSelectors.p2Minionzone.id"
      />
      <div class="p2-hero">
        <HeroSlot :player="opponentPlayer" class="p2-hero" />
        <EquipedArtifacts :player="opponentPlayer" class="artifacts" />
      </div>
      <div class="current-infos">
        <EffectChain v-if="state.effectChain?.stack.length" />
        <GamePhaseTracker v-else />
      </div>
      <div class="p1-hero">
        <EquipedArtifacts :player="myPlayer" />
        <HeroSlot :player="myPlayer" />
      </div>
      <Minionzone
        :player-id="myBoard.playerId"
        class="p1-minions"
        :id="client.ui.DOMSelectors.p1Minionzone.id"
      />
      <Deck :player="myPlayer" class="p1-deck" />
    </section> -->

      <!-- <section class="p2-zone">
      <article class="flex flex-col gap-1">
        <div class="flex gap-3 flex-row-reverse mb-2">
          <div class="avatar" />
          <div class="text-right">
            <div>{{ opponentPlayer.name }}</div>
          </div>
        </div>
        <PlayerStats
          :player="opponentPlayer"
          class="justify-end"
          :class="{ 'ui-hidden': !client.ui.displayedElements.playerInfos }"
        />
      </article>

      <DestinyZone :player-id="opponentPlayer.id" class="mt-auto" />
    </section> -->

      <!-- <section class="hand-zone">
      <Hand />
      <OpponentHand class="opponent-hand" />
    </section>
    <ActionsButtons /> -->
    </div>
  </div>
  <!-- <div class="arrows" id="arrows" /> -->
</template>

<style scoped lang="postcss">
.board-perspective-wrapper {
  perspective: 1600px;
  perspective-origin: center top;
  display: flex;
  justify-content: center;
}
.board {
  --pixel-scale: 1;
  background: url('/assets/backgrounds/board.png');
  background-size: cover;
  filter: brightness(1);
  height: 100dvh;
  aspect-ratio: 16 / 9;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  grid-row-gap: var(--size-4);
  /* background: url(/assets/backgrounds/battle-board-2.png) no-repeat center; */
  background-size: cover;
  transform-style: preserve-3d;
  perspective: 1600px;
  position: relative;
  transform-origin: center left;
  scale: var(--board-scale, 1);
  overflow: hidden;

  padding-top: var(--size-8);
  padding-inline: var(--size-6);
}

.card-container {
  --padding: 2px;
  border: solid 1px #985e25;
  width: calc(var(--card-small-width) + var(--padding) * 2);
  height: calc(var(--card-small-height) + var(--padding) * 2);
}

.minions-zone {
  display: flex;
  gap: var(--size-10);
}

.minion-row {
  display: flex;
  flex-direction: column;
  gap: var(--size-4);
}

.destiny-zone {
  height: calc(var(--card-small-height) + var(--padding) * 2);
  --padding: 2px;
  border: solid 1px #985e25;
}

.bottom-row {
  --pixel-scale: 2;
  --visible-card-ratio: 0.4;
  --scaled-height: calc(var(--card-height) * var(--pixel-scale));
  height: min(calc(var(--scaled-height) + var(--visible-card-ratio)), 200px);
}

.hero-slot {
  --pixel-scale: 2;
  width: calc(var(--card-width) * 2);
  height: calc(var(--card-height) * 2);
  border: solid 1px #985e25;
}
</style>
