<script setup lang="ts">
import { useGameUi } from '../composables/useGameClient';
import GameCard from './GameCard.vue';

const ui = useGameUi();
</script>

<template>
  <div class="highlighted-card">
    <GameCard
      :id="ui.DOMSelectors.highlightedCard.id"
      v-if="ui.highlightedCard"
      :card-id="ui.highlightedCard.id"
      :is-interactive="false"
      :show-stats="true"
      :show-modifiers="false"
      :pixel-scale="2"
    />
  </div>
</template>

<style scoped>
.highlighted-card {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  pointer-events: none;
}
</style>
