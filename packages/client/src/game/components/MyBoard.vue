<script setup lang="ts">
import { useMyPlayer } from '../composables/useGameClient';
import HeroSlot from './HeroSlot.vue';
import DiscardPile from './DiscardPile.vue';
import BanishPile from './BanishPile.vue';
import Deck from './Deck.vue';
import DestinyDeck from './DestinyDeck.vue';

const myPlayer = useMyPlayer();
</script>

<template>
  <div class="my-board">
    <div>
      <HeroSlot :player="myPlayer" class="hero" />
      <div class="destiny-zone">
        <HeroSlot :player="myPlayer" />
      </div>
    </div>

    <div class="center-zone">
      <div class="attack-zone">
        <HeroSlot :player="myPlayer" />
        <HeroSlot :player="myPlayer" />
        <HeroSlot :player="myPlayer" />
      </div>
      <div class="defense-zone">
        <HeroSlot :player="myPlayer" />
        <HeroSlot :player="myPlayer" />
      </div>
    </div>

    <div class="piles-zone">
      <DiscardPile :player="myPlayer.id" />
      <BanishPile :player="myPlayer.id" />
      <Deck :size="myPlayer.remainingCardsInMainDeck" />
      <DestinyDeck :player-id="myPlayer.id" />
    </div>
  </div>
</template>

<style scoped lang="postcss">
.my-board {
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
