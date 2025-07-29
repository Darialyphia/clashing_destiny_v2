<script setup lang="ts">
import type { PlayerViewModel } from '@game/engine/src/client/view-models/player.model';

const { player } = defineProps<{ player: PlayerViewModel }>();
</script>

<template>
  <div class="deck">
    <div
      v-for="i in player.remainingCardsInDeck"
      :key="i"
      class="card"
      :style="{ '--i': i - 1 }"
    />
  </div>
</template>

<style scoped lang="postcss">
.deck {
  display: grid;
  transform-style: preserve-3d;
  justify-self: center;
  width: 100%;
  max-width: var(--size-12);
  aspect-ratio: var(--card-ratio);
  > * {
    grid-column: 1;
    grid-row: 1;
  }
}

.card {
  background: url('/assets/ui/card-back5.png') no-repeat;
  background-size: contain;
  aspect-ratio: var(--card-ratio);
  transform: translateZ(calc(var(--i) * 1.5px));
}
</style>
