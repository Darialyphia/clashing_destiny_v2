<script setup lang="ts">
import type { PlayerViewModel } from '@game/engine/src/client/view-models/player.model';

const { player } = defineProps<{ player: PlayerViewModel }>();
</script>

<template>
  <div class="stats">
    <div>
      <div class="icon" style="--bg: url(/assets/ui/icon-influence.png)" />
      {{ player.handSize }}
    </div>

    <div>
      <div class="icon" style="--bg: url(/assets/ui/icon-deck.png)" />
      {{ player.remainingCardsInDeck }}
    </div>

    <div>
      <div class="icon" style="--bg: url(/assets/ui/icon-discard-pile.png)" />
      {{ player.discardPile.length }}
    </div>

    <div>
      <div class="icon" style="--bg: url(/assets/ui/icon-banish-pile.png)" />
      {{ player.banishPile.length }}
    </div>
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
