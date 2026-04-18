<script setup lang="ts">
import { useGameUi, useMyPlayer } from '../composables/useGameClient';
import GameCard from './GameCard.vue';

const player = useMyPlayer();
const ui = useGameUi();
</script>

<template>
  <div class="my-hero-zone">
    <div class="zone" />
    <div class="zone" />
    <GameCard
      v-if="player?.hero"
      :card-id="player.hero.id"
      variant="small"
      show-stats
      show-modifiers
      @mouseenter="ui.hoverCardOnBoard(player.hero)"
      @mouseleave="ui.unhoverCardOnBoard()"
    />
    <div class="zone" />
    <div class="zone" />
  </div>
</template>

<style scoped lang="postcss">
.my-hero-zone {
  display: flex;
  gap: 15px;
}

.zone {
  width: 148px;
  height: 130px;
  background: url('@/assets/ui/board-small-card-slot-empty.png') no-repeat
    center;
}
</style>
