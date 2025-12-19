<script setup lang="ts">
import HeroSlot from './HeroSlot.vue';
import {
  useGameUi,
  useOpponentBoard,
  useOpponentPlayer
} from '../composables/useGameClient';
import DiscardPile from './DiscardPile.vue';
import BanishPile from './BanishPile.vue';
import Deck from './Deck.vue';
import DestinyDeck from './DestinyDeck.vue';
import GameCard from './GameCard.vue';
import DestinyZone from './DestinyZone.vue';
import InspectableCard from '@/card/components/InspectableCard.vue';

const opponent = useOpponentPlayer();
const opponentBoard = useOpponentBoard();

const ui = useGameUi();
</script>

<template>
  <div class="opponent-board">
    <div class="left-zone">
      <DestinyZone :player-id="opponent.id" :teaching-mode="false" />
      <HeroSlot :player="opponent" class="hero" />
    </div>

    <div class="center-zone">
      <div
        class="defense-zone"
        :id="ui.DOMSelectors.defenseZone(opponent.id).id"
      >
        <InspectableCard
          v-for="card in opponentBoard.defenseZone"
          :key="card"
          :card-id="card"
        >
          <GameCard :card-id="card" variant="small" show-stats show-modifiers />
        </InspectableCard>
      </div>
      <div class="attack-zone" :id="ui.DOMSelectors.attackZone(opponent.id).id">
        <InspectableCard
          v-for="card in opponentBoard.attackZone"
          :key="card"
          :card-id="card"
        >
          <GameCard :card-id="card" variant="small" show-stats show-modifiers />
        </InspectableCard>
      </div>
    </div>

    <div class="piles-zone">
      <Deck :size="opponent.remainingCardsInMainDeck" />
      <DestinyDeck :player-id="opponent.id" />
      <DiscardPile :player="opponent.id" />
      <BanishPile :player="opponent.id" />
    </div>
  </div>
</template>

<style scoped lang="postcss">
.opponent-board {
  display: grid;
  grid-template-columns: auto 1fr auto;
  transform-style: preserve-3d;
  gap: var(--size-2);
  padding-top: var(--size-5);
}

.left-zone {
  display: grid;
  grid-template-rows: 1fr auto;
}

.hero {
  --pixel-scale: 1.75;
  /* fixes some mouse hit detection issues*/
  transform: translateZ(1px);
}

.center-zone {
  --pixel-scale: 1;
  display: grid;
  grid-template-rows: 1fr 1fr;
  row-gap: var(--size-1);
  /* fixes some mouse hit detection issues*/
  transform: translateZ(1px);
}

.attack-zone {
  border: solid 1px #985e25;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  &::after {
    content: 'Attack Zone';
    position: absolute;
    bottom: var(--size-1);
    left: var(--size-3);
    color: #d7ad42;
    font-size: var(--font-size-0);
  }
}

.defense-zone {
  border: solid 1px #985e25;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  &::after {
    content: 'Defense Zone';
    position: absolute;
    bottom: var(--size-1);
    left: var(--size-3);
    color: #d7ad42;
    font-size: var(--font-size-0);
  }
}

.piles-zone {
  display: grid;
  grid-template-columns: 1fr 1fr;
  row-gap: var(--size-7);
  column-gap: var(--size-4);
  place-content: center;
  transform-style: preserve-3d;
}
</style>
