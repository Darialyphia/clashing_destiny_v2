<script setup lang="ts">
import CardBack from '@/card/components/CardBack.vue';
import GameCard from './GameCard.vue';
import type { IncomingCard } from '../composables/useCardToHandFx';

const { card } = defineProps<{ card: IncomingCard }>();
</script>

<template>
  <div class="card-to-hand-ghost" :data-card-to-hand-ghost="card.cardId">
    <div v-if="card.source === 'supply'" class="ghost-small">
      <GameCard
        :card-id="card.cardId"
        variant="small"
        :is-interactive="false"
      />
    </div>
    <div class="ghost-big">
      <div class="ghost-faces">
        <GameCard
          v-if="card.hasFront"
          :card-id="card.cardId"
          :is-interactive="false"
          class="ghost-front"
        />
        <CardBack class="ghost-back" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="postcss">
.card-to-hand-ghost {
  pointer-events: none;
}

/* positioned by gsap, they stay hidden until then */
.ghost-small,
.ghost-big {
  --pixel-scale: 1;
  position: fixed;
  top: 0;
  left: 0;
  visibility: hidden;
}

.ghost-faces {
  position: relative;
  transform-style: preserve-3d;
}

.ghost-front,
.ghost-back {
  backface-visibility: hidden;
}

/* the back gives the ghost its size, since the front is missing for the opponent's drawn cards */
.ghost-front {
  position: absolute;
  inset: 0;
}

.ghost-back {
  transform: rotateY(180deg);
}

/* the opponent's cards get hidden mid-flight, but the supply card it morphs from was revealed */
.ghost-small :deep(.game-card.flipped) {
  transform: none;
}
</style>
