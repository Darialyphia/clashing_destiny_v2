<script setup lang="ts">
import HeroSlot from './HeroSlot.vue';
import { useOpponentPlayer } from '../composables/useGameClient';
import DiscardPile from './DiscardPile.vue';
import BanishPile from './BanishPile.vue';
import Deck from './Deck.vue';
import DestinyDeck from './DestinyDeck.vue';

const opponent = useOpponentPlayer();
</script>

<template>
  <div class="opponent-board">
    <div>
      <HeroSlot :player="opponent" class="hero" />
      <div class="destiny-zone">
        <HeroSlot :player="opponent" />
      </div>
    </div>

    <div class="center-zone">
      <div class="defense-zone">
        <HeroSlot :player="opponent" />
      </div>
      <div class="attack-zone">
        <HeroSlot :player="opponent" />
        <HeroSlot :player="opponent" />
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
}

.center-zone {
  --pixel-scale: 1;
  display: grid;
  grid-template-rows: 1fr 1fr;
}

.attack-zone {
  display: flex;
  justify-content: center;
  align-items: center;
}

.defense-zone {
  display: flex;
  justify-content: center;
  align-items: center;
}

.destiny-zone {
  --pixel-scale: 0.5;
}

:global(.destiny-zone .game-card) {
  transform: rotateY(180deg);
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
