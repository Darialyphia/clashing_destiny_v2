<script setup lang="ts">
import CardBack from '@/card/components/CardBack.vue';
import GameCard from './GameCard.vue';

const { cardId } = defineProps<{ cardId: string }>();
</script>

<template>
  <div class="supply-to-hand-ghost" :data-supply-to-hand-ghost="cardId">
    <div class="ghost-small">
      <GameCard :card-id="cardId" variant="small" :is-interactive="false" />
    </div>
    <div class="ghost-big">
      <div class="ghost-faces">
        <GameCard
          :card-id="cardId"
          :is-interactive="false"
          class="ghost-front"
        />
        <CardBack class="ghost-back" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="postcss">
.supply-to-hand-ghost {
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

.ghost-back {
  position: absolute;
  inset: 0;
  transform: rotateY(180deg);
}

/* the opponent's cards get hidden mid-flight, but the supply card it morphs from was revealed */
.ghost-small :deep(.game-card.flipped) {
  transform: none;
}
</style>
