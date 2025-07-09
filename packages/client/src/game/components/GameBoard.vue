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

const state = useGameState();
const myBoard = useMyBoard();
const opponentBoard = useOpponentBoard();

const myPlayer = useMyPlayer();
const opponentPlayer = useOpponentPlayer();
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
      <article>
        <div class="flex gap-3 mb-2">
          <div class="avatar" />
          <div>
            <div>{{ myPlayer.name }}</div>
            <div>TODO player titles</div>
          </div>
        </div>
        <PlayerStats :player="myPlayer" />
      </article>

      <HeroSlot :player="myPlayer" class="hero-slot" />
      <DestinyZone :player-id="myPlayer.id" />
    </section>

    <section class="middle-zone">
      <Minionzone :player-id="opponentBoard.playerId" class="p2-minions" />
      <div class="flex flex-col gap-2">
        <EffectChain v-if="state.effectChain?.stack.length" />
        <GamePhaseTracker v-else />
      </div>
      <Minionzone :player-id="myBoard.playerId" class="p1-minions" />
    </section>

    <section class="p2-zone">
      <article>
        <div class="flex gap-3 flex-row-reverse mb-2">
          <div class="avatar" />
          <div class="text-right">
            <div>{{ opponentPlayer.name }}</div>
            <div>TODO player titles</div>
          </div>
        </div>
        <PlayerStats :player="opponentPlayer" class="justify-end" />
      </article>

      <HeroSlot :player="opponentPlayer" class="hero-slot" />
      <DestinyZone :player-id="opponentPlayer.id" />
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
  grid-template-columns: calc(240 / 800 * 100%) 1fr calc(240 / 800 * 100%);
  grid-template-rows: 1fr calc(var(--pixel-scale) * var(--card-height) * 0.38);
  margin-inline: auto;
  /* background: url(/assets/backgrounds/battle-board.png) no-repeat center; */
  background-size: cover;
  /* transform-style: preserve-3d; */
}

.p1-zone {
  grid-column: 1;
  position: relative;
  z-index: 1;
  .hero-slot {
    align-self: flex-start;
  }
}

.p2-zone {
  grid-column: 3;
  grid-row: 1;
  .hero-slot {
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
}

.middle-zone {
  grid-column: 2;
  grid-row: 1;
  display: grid;
  grid-template-rows: 1fr auto 1fr;
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
}
</style>
