<script setup lang="ts">
import { useGameUi, useMyPlayer } from '../composables/useGameClient';
import GameCard from './GameCard.vue';
import Hero from './Hero.vue';

const player = useMyPlayer();
const ui = useGameUi();
</script>

<template>
  <div class="my-hero-zone">
    <div class="zone" />
    <div class="zone" />
    <Hero :player="player" />
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
    <div class="zone">
      <GameCard
        v-if="player.artifacts[1]"
        :card-id="player.artifacts[1].id"
        variant="small"
        show-stats
        show-modifiers
        :overrides="{
          durability: player.artifacts[1].durability
        }"
        @mouseenter="ui.hoverCardOnBoard(player.artifacts[1].card)"
        @mouseleave="ui.unhoverCardOnBoard()"
      />
    </div>
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
