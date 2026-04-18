<script setup lang="ts">
import GameCard from './GameCard.vue';
import { useGameUi } from '../composables/useGameClient';

const ui = useGameUi();
</script>

<template>
  <div class="hovered-cell-infos">
    <Transition appear>
      <div v-if="ui.hoveredCell?.unit?.card" class="hovered-card">
        <GameCard
          :card-id="ui.hoveredCell.unit.card.id"
          :is-interactive="false"
        />
      </div>
    </Transition>

    <Transition appear>
      <div v-if="ui.hoveredCardOnBoard" class="hovered-card">
        <GameCard :card-id="ui.hoveredCardOnBoard.id" :is-interactive="false" />
      </div>
    </Transition>
  </div>
</template>

<style scoped lang="postcss">
.hovered-cell-infos {
  color: white;
  font-size: 12px;
  border-radius: 4px;
}

.hovered-card {
  &.v-enter-active,
  &.v-leave-active {
    transition: all 0.3s var(--ease-3);
  }

  &.v-enter-from,
  &.v-leave-to {
    translate: calc(-1 * var(--size-8)) 0;
    opacity: 0;
  }
}
</style>
