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
import TalentTree from './TalentTree.vue';
import Hand from '@/card/components/Hand.vue';
import DestinyZone from './DestinyZone.vue';
import ExplainerMessage from './ExplainerMessage.vue';
import EffectChain from './EffectChain.vue';

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
  <div class="arrows" id="arrows" />

  <div class="board" id="board">
    <section class="p1-zone">
      <div class="flex gap-3 mb-4">
        <div class="avatar" />
        <div>
          <div>{{ myPlayer.name }}</div>
          <div>TODO player titles</div>
        </div>

        <div class="stats">
          <div>
            <div
              class="icon"
              style="--bg: url(/assets/ui/icon-influence.png)"
            />
            {{ myPlayer.handSize }}
          </div>

          <div>
            <div class="icon" style="--bg: url(/assets/ui/icon-deck.png)" />
            {{ myPlayer.remainingCardsInDeck }}
          </div>

          <div>
            <div
              class="icon"
              style="--bg: url(/assets/ui/icon-discard-pile.png)"
            />
            {{ myPlayer.getDiscardPile().length }}
          </div>

          <div>
            <div
              class="icon"
              style="--bg: url(/assets/ui/icon-banish-pile.png)"
            />
            {{ myPlayer.getBanishPile().length }}
          </div>
        </div>
      </div>

      <DestinyZone :player-id="myPlayer.id" />

      <div class="grid cols-2 gap-2 mb-2">
        <div>
          <TalentTree :player="myPlayer" />
        </div>
        <div>
          <HeroSlot :player="myPlayer" />
        </div>
      </div>
    </section>

    <section class="middle-zone">
      <Minionzone :player-id="opponentBoard.playerId" class="p2-minions" />
      <div class="flex flex-col gap-2 h-[128px]">
        <EffectChain v-if="state.effectChain" />
        <GamePhaseTracker v-else />
        <div class="flex justify-end items-center gap-2">
          <ExplainerMessage />
          <ActionsButtons />
        </div>
      </div>
      <Minionzone :player-id="myBoard.playerId" class="p1-minions" />
    </section>

    <section class="p2-zone">
      <div class="flex gap-3 flex-row-reverse mb-4">
        <div class="avatar" />
        <div class="text-right">
          <div>{{ opponentPlayer.name }}</div>
          <div>TODO player titles</div>
        </div>
        <div class="stats justify-end">
          <div>
            <div
              class="icon"
              style="--bg: url(/assets/ui/icon-influence.png)"
            />
            {{ opponentPlayer.handSize }}
          </div>

          <div>
            <div class="icon" style="--bg: url(/assets/ui/icon-deck.png)" />
            {{ opponentPlayer.remainingCardsInDeck }}
          </div>

          <div>
            <div
              class="icon"
              style="--bg: url(/assets/ui/icon-discard-pile.png)"
            />
            {{ opponentPlayer.getDiscardPile().length }}
          </div>

          <div>
            <div
              class="icon"
              style="--bg: url(/assets/ui/icon-banish-pile.png)"
            />
            {{ opponentPlayer.getBanishPile().length }}
          </div>
        </div>
      </div>

      <div class="grid cols-2 gap-2 mb-2">
        <div>
          <HeroSlot :player="opponentPlayer" />
        </div>
        <div>
          <TalentTree :player="opponentPlayer" />
        </div>
      </div>

      <DestinyZone :player-id="opponentPlayer.id" />
    </section>

    <section class="hand-zone">
      <Hand />
    </section>
  </div>
</template>

<style scoped lang="postcss">
.board {
  --pixel-scale: 2;
  height: 100dvh;
  aspect-ratio: 16 / 9;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  grid-template-rows: 1fr calc(var(--pixel-scale) * var(--card-height) * 0.5);
  margin-inline: auto;
  background: url(/assets/backgrounds/battle-board.png) no-repeat center;
  background-size: cover;
}

.p1-zone {
  grid-column: 1;
  grid-row: 1;
  grid-template-rows: auto 1fr auto;
}

.p2-zone {
  grid-column: 3;
  grid-row: 1;
  grid-template-rows: auto auto 1fr;
}

.p1-zone,
.p2-zone {
  padding: var(--size-6) var(--size-6) 0;
  display: grid;
}

.middle-zone {
  grid-column: 2;
  grid-row: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: var(--size-5);
}

.hand-zone {
  grid-column: 1 / -1;
  grid-row: 2;
}

/* .p1-zone,
.p1-minions,
.hand-zone {
  background-color: #448;
}

.p2-zone,
.p2-minions {
  background-color: #844;
} */

.p1-minions,
.p2-minions {
  flex-grow: 1;
}

.avatar {
  width: var(--size-8);
  aspect-ratio: 1;
  border-radius: var(--radius-round);
  background-color: black;
  align-self: center;
}

.stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--size-2);
  > * {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--size-2);
  }
}

.icon {
  aspect-ratio: 1;
  width: calc(16px * var(--pixel-scale));
  background: var(--bg) no-repeat center;
  background-size: cover;
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
</style>
