<script setup lang="ts">
import { GAME_PHASES } from '@game/engine/src/game/game.enums';
import { useGameState } from '../composables/useGameClient';

const state = useGameState();

const indicatorOffset = computed(() => {
  switch (state.value.phase.state) {
    case GAME_PHASES.DRAW:
      return 0;
    case GAME_PHASES.DESTINY:
      return 1;
    case GAME_PHASES.MAIN:
      return 2;
    case GAME_PHASES.ATTACK:
      return 3;
    case GAME_PHASES.END:
      return 4;
    default:
      return 0; // Default to DRAW phase if unknown
  }
});
</script>

<template>
  <div class="phase-tracker">
    <div class="phase" style="--col: 1">DRAW</div>
    <div class="phase" style="--col: 2">DESTINY</div>
    <div class="phase" style="--col: 3">MAIN</div>
    <div class="phase" style="--col: 4">COMBAT</div>
    <div class="phase" style="--col: 5">END</div>
  </div>
</template>

<style scoped lang="postcss">
.phase-tracker {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  &::after {
    content: '';
    position: absolute;
    height: 100%;
    width: 20%;
    box-sizing: content-box;
    background-color: white;
    mix-blend-mode: difference;
    transform: translateX(calc(v-bind(indicatorOffset) * 100%));
    transition: transform 0.3s ease-in-out;
  }
}
.phase {
  text-align: center;
  border: solid 2px white;
  border-radius: var(--radius-2);
  padding: var(--size-2) var(--size-3);
  font-size: var(--font-size-3);
  grid-column: var(--col);
}
</style>
