<script setup lang="ts">
import { useGameUi } from '../composables/useGameClient';
import GameCard from './GameCard.vue';

const ui = useGameUi();
</script>

<template>
  <div class="highlighted-card">
    <Transition>
      <GameCard
        v-if="ui.highlightedCard"
        :id="ui.DOMSelectors.highlightedCard.id"
        :card-id="ui.highlightedCard.id"
        :is-interactive="false"
        :show-stats="true"
        :show-modifiers="false"
        :pixel-scale="2"
      />
    </Transition>
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

.v-enter-active,
.v-leave-active {
  transition: opacity 0.3s var(--ease-2);
}
.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
