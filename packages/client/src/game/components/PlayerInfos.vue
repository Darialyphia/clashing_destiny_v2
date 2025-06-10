<script setup lang="ts">
import { useMyPlayer, useOpponentPlayer } from '../composables/useGameClient';

const myPlayer = useMyPlayer();
const opponentPlayer = useOpponentPlayer();
</script>

<template>
  <header class="player-infos">
    <div>
      <h2>{{ myPlayer.name }}</h2>
      <div class="flex gap-2">
        <img
          v-for="affinity in myPlayer.unlockedAffinities"
          :key="affinity"
          :src="`/assets/ui/affinity-${affinity.toLocaleLowerCase()}.png`"
          class="affinity-icon"
        />
      </div>
    </div>
    <div>
      <h2>{{ opponentPlayer.name }}</h2>
      <div class="flex gap-2">
        <img
          v-for="affinity in opponentPlayer.unlockedAffinities"
          :key="affinity"
          :src="`/assets/ui/affinity-${affinity.toLocaleLowerCase()}.png`"
          class="affinity-icon"
        />
      </div>
      <div>hand: {{ opponentPlayer.handSize }}</div>
    </div>
  </header>
</template>

<style scoped lang="postcss">
.player-infos {
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  display: fixed;
  top: 0;
  width: 100%;
  pointer-events: none;
}
</style>
