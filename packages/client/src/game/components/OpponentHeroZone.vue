<script setup lang="ts">
import { useGameUi, useOpponentPlayer } from '../composables/useGameClient';
import GameCard from './GameCard.vue';

const player = useOpponentPlayer();
const ui = useGameUi();
</script>

<template>
  <div class="opponent-hero-zone">
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
.opponent-hero-zone {
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
