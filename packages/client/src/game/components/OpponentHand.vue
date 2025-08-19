<script setup lang="ts">
import {
  useGameClient,
  useOpponentPlayer
} from '@/game/composables/useGameClient';
import CardBack from '@/card/components/CardBack.vue';

const opponent = useOpponentPlayer();
const client = useGameClient();

const cardSpacing = computed(() => {
  const handSize = opponent.value.handSize;
  const base = 80;
  return handSize > 7 ? base - 0 * (handSize - 6) : base;
});

const angle = computed(() => {
  const handSize = opponent.value.handSize;
  return handSize > 7 ? 5 - (handSize - 6) * 0.5 : 5;
});
</script>

<template>
  <section
    :id="`hand-${opponent.id}`"
    class="hand"
    :class="{
      'ui-hidden': !client.ui.displayedElements.hand
    }"
    :style="{ '--hand-size': opponent.handSize, '--angle': angle }"
  >
    <div
      class="card"
      v-for="i in opponent.handSize"
      :key="`hand-${opponent.id}-card-${i}`"
      :style="{
        '--index': i - 1,
        '--offset': Math.abs(i - 1 - opponent.handSize / 2)
      }"
    >
      <CardBack />
    </div>
  </section>
</template>

<style scoped lang="postcss">
.hand {
  position: relative;
  z-index: 1;
  display: grid;
  justify-items: center;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;
  transform: rotateZ(180deg) translateY(75%);
  --offset-step: calc(1px * v-bind(cardSpacing));

  > * {
    grid-row: 1;
    grid-column: 1;
    position: relative;
    --base-angle: calc((var(--hand-size) * 0.4) * var(--angle) * -1deg);
    --base-offset: calc((var(--hand-size) / 2) * var(--offset-step) * -1);
    --rotation: calc(var(--base-angle) + var(--index) * var(--angle) * 1deg);
    /* --rotation: 0deg; */
    /* --y-offset: calc(var(--offset) * 10px); */
    --y-offset: 0;
    transform-origin: center 120%;
    transform: translateX(
        calc(var(--base-offset) + (var(--index) + 0.5) * var(--offset-step))
      )
      translateY(var(--y-offset)) rotate(var(--rotation));
    transition: transform 0.2s ease-out;
  }
}

.card {
  width: var(--card-width);
  height: var(--card-height);
}

@media (width < 1024px) {
  .hand {
    transform: scale(0.5);
  }
}
</style>
