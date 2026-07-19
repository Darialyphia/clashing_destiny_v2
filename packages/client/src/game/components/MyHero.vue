<script setup lang="ts">
import { INTERACTION_STATES } from '@game/engine/src/game/game.enums';
import {
  useGameState,
  useGameUi,
  useMyPlayer
} from '../composables/useGameClient';
import BoardCard from './BoardCard.vue';

const ui = useGameUi();
const myPlayer = useMyPlayer();
const state = useGameState();

const canSelectHero = computed(() => {
  if (!ui.value.isInteractivePlayer) return false;
  if (state.value.interaction.state !== INTERACTION_STATES.IDLE) return false;
  if (!myPlayer.value.canTakeResourceAction) return false;
  return true;
});
</script>

<template>
  <div class="wrapper" :class="{ 'can-act': canSelectHero }">
    <BoardCard
      v-if="myPlayer.hero"
      :card="myPlayer.hero"
      @mouseenter="ui.hover(myPlayer.hero)"
      @mouseleave="ui.unhover()"
    />
  </div>
</template>

<style scoped lang="postcss">
.wrapper {
  position: relative;
  &.can-act {
    cursor: pointer;

    & :deep(.unit) {
      --shadow-color: var(--yellow-5);
      filter: drop-shadow(0 0 10px var(--shadow-color));
      animation: pulse-hero 2s infinite ease-in-out;
    }
  }
}

@keyframes pulse-hero {
  0%,
  100% {
    filter: drop-shadow(0 0 5px var(--lime-5));
  }
  50% {
    filter: drop-shadow(0 0 15px var(--lime-3));
  }
}
</style>
