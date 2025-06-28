<script setup lang="ts">
import type { PlayerViewModel } from '@game/engine/src/client/view-models/player.model';
import { useBoardSide, useCard } from '../composables/useGameClient';

const { player } = defineProps<{ player: PlayerViewModel }>();

const boardSide = useBoardSide(computed(() => player.id));
const hero = useCard(computed(() => boardSide.value.heroZone.hero));
</script>

<template>
  <div class="hero-slot" :style="{ '--bg': `url(${hero.imagePath})` }"></div>
</template>

<style scoped lang="postcss">
.hero-slot {
  --pixel-scale: 2;
  position: relative;
  aspect-ratio: var(--hero-ratio);
  max-height: calc(var(--pixel-scale) * var(--hero-height));
  background: url('/assets/ui/card-board-front.png') no-repeat center;
  background-size: cover;
  overflow: hidden;
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: var(--bg) no-repeat center top;
    background-size: calc(96px * var(--pixel-scale));
  }
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: var(--bg) no-repeat center top;
    background-size: calc(96px * var(--pixel-scale));
    transform: scaleY(-1) translateY(-40px) skewX(30deg) translateX(-20px);
    filter: brightness(0);
    opacity: 0.5;
  }
}
</style>
