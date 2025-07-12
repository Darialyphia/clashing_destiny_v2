<script setup lang="ts">
import AffinityModal from './AffinityModal.vue';
import CombatArrows from './CombatArrows.vue';
import ChooseCardModal from './ChooseCardModal.vue';
import PlayedCard from './PlayedCard.vue';
import SVGFilters from './SVGFilters.vue';
import DestinyCostVFX from './DestinyCostVFX.vue';
import BattleLog from './BattleLog.vue';
import Minionzone from './Minionzone.vue';
import GamePhaseTracker from './GamePhaseTracker.vue';
import {
  useGameState,
  useMyBoard,
  useMyPlayer,
  useOpponentBoard,
  useOpponentPlayer
} from '../composables/useGameClient';
import ActionsButtons from './ActionsButtons.vue';
import HeroSlot from './HeroSlot.vue';
import Hand from '@/card/components/Hand.vue';
import DestinyZone from './DestinyZone.vue';
import ExplainerMessage from './ExplainerMessage.vue';
import EffectChain from './EffectChain.vue';
import PlayerStats from './PlayerStats.vue';
import TalentTree from './TalentTree.vue';
import UnlockedAffinities from './UnlockedAffinities.vue';
import { useMouse } from '@vueuse/core';
import { mapRange } from '@game/shared';

const state = useGameState();
const myBoard = useMyBoard();
const opponentBoard = useOpponentBoard();

const myPlayer = useMyPlayer();
const opponentPlayer = useOpponentPlayer();

const { x, y } = useMouse();
const angleZ = computed(() => {
  return mapRange(Math.round(x.value), [0, window.innerWidth], [-180, 180]);
});
const angleX = computed(() => {
  return mapRange(
    window.innerHeight - Math.round(y.value),
    [0, window.innerHeight],
    [-180, 180]
  );
});
</script>

<template>
  <!-- <ManaCostModal /> -->
  <BattleLog />
  <SVGFilters />
  <!-- <DestinyPhaseModal /> -->
  <AffinityModal />
  <ChooseCardModal />
  <CombatArrows />
  <PlayedCard />
  <DestinyCostVFX />

  <div class="explainer">
    <ExplainerMessage />
  </div>
  <ActionsButtons />

  <div class="board" id="board">
    <section class="p1-zone">
      <article class="flex flex-col gap-1">
        <div class="flex gap-3 mb-2">
          <div class="avatar" />
          <div>
            <div>{{ myPlayer.name }}</div>
            <div>TODO player titles</div>
          </div>
        </div>
        <PlayerStats :player="myPlayer" />
        <UnlockedAffinities :player="myPlayer" class="affinities" />
      </article>

      <DestinyZone :player-id="myPlayer.id" />
      <!-- <TalentTree :player="myPlayer" class="talent-tree" /> -->
    </section>

    <section class="middle-zone">
      <HeroSlot :player="opponentPlayer" class="absolute bottom-[100%]" />
      <Minionzone :player-id="opponentBoard.playerId" class="p2-minions" />
      <div class="flex flex-col gap-2 justify-center">
        <EffectChain v-if="state.effectChain?.stack.length" />
        <GamePhaseTracker v-else />
      </div>
      <Minionzone :player-id="myBoard.playerId" class="p1-minions" />
      <HeroSlot :player="myPlayer" class="absolute top-[100%] p1-hero" />
    </section>

    <section class="p2-zone">
      <article class="flex flex-col gap-1">
        <div class="flex gap-3 flex-row-reverse mb-2">
          <div class="avatar" />
          <div class="text-right">
            <div>{{ opponentPlayer.name }}</div>
            <div>TODO player titles</div>
          </div>
        </div>
        <PlayerStats :player="opponentPlayer" class="justify-end" />
        <UnlockedAffinities :player="opponentPlayer" class="justify-end" />
      </article>

      <DestinyZone :player-id="opponentPlayer.id" />
      <!-- <TalentTree :player="opponentPlayer" class="talent-tree" /> -->
    </section>

    <section class="hand-zone">
      <Hand />
    </section>
  </div>
  <div class="arrows" id="arrows" />
</template>

<style scoped lang="postcss">
.board {
  --pixel-scale: 2;
  filter: brightness(1);
  height: 100dvh;
  aspect-ratio: 16 / 9;
  display: grid;
  grid-template-columns: calc(220 / 800 * 100%) 1fr calc(220 / 800 * 100%);
  grid-template-rows: 1fr calc(var(--pixel-scale) * var(--card-height) * 0.38);
  margin-inline: auto;
  background: url(/assets/backgrounds/battle-board-2.png) no-repeat center;
  background-size: cover;
  /* transform-style: preserve-3d; */
  position: relative;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    mix-blend-mode: screen;
    opacity: 0.25;
    z-index: 1;
  }
}

.p1-zone {
  grid-column: 1;
  position: relative;
  z-index: 1;

  .talent-tree {
    align-self: flex-start;
  }
}

.p2-zone {
  grid-column: 3;
  grid-row: 1;

  .talent-tree {
    align-self: flex-end;
  }
}

.p1-zone,
.p2-zone {
  padding: var(--size-6) var(--size-6) 0;
  display: flex;
  flex-direction: column;
  gap: var(--size-4);
  grid-row: 1;
  /* pointer-events: none; */
  align-self: start;
}

.middle-zone {
  grid-column: 2;
  grid-row: 1;
  display: grid;
  gap: var(--size-2);
  grid-template-rows: auto 1fr auto 1fr auto;
  position: relative;
  z-index: 1;
  align-self: center;
  --angleZ: calc(1deg * v-bind(angleZ));
  --angleX: calc(1deg * v-bind(angleX));
  /* transform: rotateY(-0deg) rotateX(var(--angleX)) rotateZ(var(--angleZ))
    scale(1); */
  transform: rotateY(-0deg) rotateX(60deg) rotateZ(45deg) scale(1);
  transform-style: preserve-3d;
}

.hand-zone {
  grid-column: 1 / -1;
  grid-row: 2;
}

.p1-minions,
.p2-minions {
  flex-grow: 1;
  align-self: center;
  transform-style: preserve-3d;
}

.avatar {
  width: var(--size-8);
  aspect-ratio: 1;
  border-radius: var(--radius-round);
  background-color: black;
  align-self: center;
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

.explainer {
  position: fixed;
  top: var(--size-3);
  width: 100%;
  display: flex;
  justify-content: center;
  pointer-events: none;
  z-index: 1;
}

.p1-hero {
  translate: 50% 50%;
}
</style>
