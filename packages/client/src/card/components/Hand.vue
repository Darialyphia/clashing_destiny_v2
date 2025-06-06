<script setup lang="ts">
import { useMyBoard } from '@/game/composables/useGameClient';
import GameCard from '@/game/components/GameCard.vue';

const myBoard = useMyBoard();
</script>

<template>
  <section
    class="hand"
    :style="{ '--hand-size': myBoard.hand.length, '--angle': 5 }"
  >
    <div
      class="card"
      v-for="(cardId, index) in myBoard.hand"
      :key="cardId"
      :style="{
        '--index': index,
        '--offset': Math.abs(index - myBoard.hand.length / 2)
      }"
    >
      <GameCard :card-id="cardId" />
    </div>
  </section>
</template>

<style scoped lang="postcss">
.hand {
  position: fixed;
  bottom: 0;
  height: 250px;
  width: 100%;
  z-index: 1;
  display: grid;
  justify-items: center;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;
  --offset-step: 125px;

  &:has(:hover) {
    --offset-step: 175px;
  }

  > * {
    grid-row: 1;
    grid-column: 1;
    position: relative;

    --base-angle: calc((var(--hand-size) * 0.4) * var(--angle) * -1deg);
    --base-offset: calc((var(--hand-size) / 2) * var(--offset-step) * -1);
    --rotation: calc(var(--base-angle) + var(--index) * var(--angle) * 1deg);
    /* --rotation: 0deg; */
    --y-offset: calc(var(--offset) * 20px - 4rem);
    --counter-rotation: 0;
    transform-origin: center 120%;
    transform: translateX(
        calc(var(--base-offset) + (var(--index) + 0.5) * var(--offset-step))
      )
      rotate(var(--rotation)) translateY(var(--y-offset))
      rotate(var(--counter-rotation));
    transition: transform 0.2s ease-out;

    &:hover {
      z-index: 1;
      --y-offset: -13rem;
      --counter-rotation: calc(var(--rotation) * -1);
    }
  }
}
</style>
