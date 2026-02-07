<script setup lang="ts">
import HeroSlot from './HeroSlot.vue';
import {
  useGameClient,
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
const { playerId: activePlayerId } = useGameClient();
const ui = useGameUi();
</script>

<template>
  <div
    class="opponent-board"
    :class="{ 'is-active': opponent.id === activePlayerId }"
  >
    <div class="left-zone">
      <div
        class="artifacts"
        :class="{ 'is-condensed': opponentBoard.heroZone.artifacts.length > 2 }"
      >
        <InspectableCard
          v-for="artifact in opponentBoard.heroZone.artifacts"
          :key="artifact"
          :card-id="artifact"
          :open-delay="0"
          side="right"
        >
          <GameCard :card-id="artifact" variant="small" show-stats can-tilt />
        </InspectableCard>
      </div>
      <HeroSlot :player="opponent" class="hero" />
    </div>

    <div class="center-zone">
      <DestinyZone
        class="destiny-zone"
        :player-id="opponent.id"
        :teaching-mode="false"
      />
      <div class="minion-zone" :id="ui.DOMSelectors.minionZone(opponent.id).id">
        <InspectableCard
          v-for="card in opponentBoard.minions"
          :key="card"
          :card-id="card"
          side="left"
        >
          <GameCard
            :card-id="card"
            variant="small"
            show-stats
            show-modifiers
            can-tilt
          />
        </InspectableCard>
        <InspectableCard
          v-for="card in opponentBoard.sigils"
          :key="card"
          side="left"
          :card-id="card"
        >
          <GameCard
            :card-id="card"
            variant="small"
            show-stats
            show-modifiers
            can-tilt
          />
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

  &.is-active {
    box-shadow: inset 0 0 40px #25a9e099;
  }
}

.left-zone {
  display: grid;
  grid-template-rows: 1fr auto;
  padding-inline-end: var(--size-5);
}

.hero {
  --pixel-scale: 1.5;
  /* fixes some mouse hit detection issues*/
  transform: translateZ(1px);
  @screen lt-lg {
    --pixel-scale: 1;
  }
}

.center-zone {
  --pixel-scale: 1;
  @screen lt-lg {
    --pixel-scale: 0.5;
  }
  display: grid;
  grid-template-rows: 1fr 1fr;
  row-gap: var(--size-1);
  /* fixes some mouse hit detection issues*/
  transform: translateZ(1px);
}

.minion-zone {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.destiny-zone {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.piles-zone {
  display: grid;
  grid-template-columns: 1fr 1fr;
  row-gap: var(--size-7);
  column-gap: var(--size-4);
  place-content: center;
  transform-style: preserve-3d;
}

.artifacts {
  --pixel-scale: 0.75;
  @screen lt-lg {
    --pixel-scale: 0.33;
  }
  display: flex;
  gap: var(--size-1);
  align-self: center;

  &.is-condensed {
    --pixel-scale: 0.5;
  }
}
</style>
