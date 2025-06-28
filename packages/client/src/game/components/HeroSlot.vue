<script setup lang="ts">
import type { PlayerViewModel } from '@game/engine/src/client/view-models/player.model';
import { useBoardSide, useCard } from '../composables/useGameClient';
import UnlockedAffinities from './UnlockedAffinities.vue';
import EquipedArtifacts from './EquipedArtifacts.vue';
import CardStats from './CardStats.vue';

const { player } = defineProps<{ player: PlayerViewModel }>();

const boardSide = useBoardSide(computed(() => player.id));
const hero = useCard(computed(() => boardSide.value.heroZone.hero));
</script>

<template>
  <div class="hero-slot" :style="{ '--bg': `url(${hero.imagePath})` }">
    <UnlockedAffinities :player="player" class="affinities" />
    <EquipedArtifacts :player="player" class="artifacts" />
    <CardStats :card-id="hero.id" />
  </div>
</template>

<style scoped lang="postcss">
.hero-slot {
  --pixel-scale: 2;
  position: relative;
  aspect-ratio: var(--hero-ratio);
  max-height: calc(var(--pixel-scale) * var(--hero-height));
  background: url('/assets/ui/card-board-front.png') no-repeat center;
  background-size: cover;
  /* overflow: hidden; */
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
    transform: scaleY(-0.5) translateY(-40px) skewX(20deg) translateX(-20px);
    filter: brightness(0);
    opacity: 0.5;
  }

  .affinities {
    position: absolute;
    top: calc(-1 * var(--size-2));
    right: calc(-1 * var(--size-2));
    z-index: 1;
  }
  .artifacts {
    position: absolute;
    bottom: 0;
    left: calc(-1 * var(--size-3));
    z-index: 1;
  }
}
</style>
