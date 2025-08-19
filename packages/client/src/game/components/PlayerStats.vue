<script setup lang="ts">
import type { PlayerViewModel } from '@game/engine/src/client/view-models/player.model';
import DiscardPile from './DiscardPile.vue';
import BanishPile from './BanishPile.vue';

const { player } = defineProps<{ player: PlayerViewModel }>();

const isDiscardPileOpened = ref(false);
const isBanishPileOpened = ref(false);
</script>

<template>
  <div class="stats">
    <div>
      <div class="icon" style="--bg: url(/assets/ui/icon-influence.png)" />
      {{ player.influence }}
    </div>

    <div>
      <div class="icon" style="--bg: url(/assets/ui/icon-deck.png)" />
      {{ player.remainingCardsInDeck }}
    </div>

    <button @click="isDiscardPileOpened = !isDiscardPileOpened">
      <div class="icon" style="--bg: url(/assets/ui/icon-discard-pile.png)" />
      {{ player.discardPile.length }}
    </button>
    <DiscardPile v-model:is-opened="isDiscardPileOpened" :player="player.id" />

    <button @click="isBanishPileOpened = !isBanishPileOpened">
      <div class="icon" style="--bg: url(/assets/ui/icon-banish-pile.png)" />
      {{ player.banishPile.length }}
    </button>
    <BanishPile v-model:is-opened="isBanishPileOpened" :player="player.id" />
  </div>
</template>

<style scoped lang="postcss">
.stats {
  display: flex;
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
</style>
