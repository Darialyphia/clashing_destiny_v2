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
    <div class="zone">
      <GameCard
        v-if="player.artifacts[0]"
        :card-id="player.artifacts[0].id"
        variant="small"
        show-stats
        show-modifiers
        :overrides="{
          durability: player.artifacts[0].durability
        }"
        @mouseenter="ui.hoverCardOnBoard(player.artifacts[0].card)"
        @mouseleave="ui.unhoverCardOnBoard()"
      />
    </div>
    <div class="zone"></div>
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
