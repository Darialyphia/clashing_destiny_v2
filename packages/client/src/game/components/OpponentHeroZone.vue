<script setup lang="ts">
import { useOpponentPlayer } from '../composables/useGameClient';
import Hero from './Hero.vue';
import EquippedArtifact from './EquippedArtifact.vue';

const player = useOpponentPlayer();
</script>

<template>
  <div class="opponent-hero-zone">
    <div class="zone" />
    <div class="zone" />
    <Hero :player="player" />
    <div class="zone">
      <EquippedArtifact
        v-if="player.artifacts[0]"
        :artifact="player.artifacts[0]"
      />
    </div>
    <div class="zone">
      <EquippedArtifact
        v-if="player.artifacts[1]"
        :artifact="player.artifacts[1]"
      />
    </div>
  </div>
</template>

<style scoped lang="postcss">
.opponent-hero-zone {
  display: flex;
  gap: 15px;
}

.zone {
  width: 148px;
  height: 130px;
  background: url('@/assets/ui/board-small-card-slot-empty.png') no-repeat
    center;
}

.can-attack {
  filter: drop-shadow(0 0 6px red);
  transition: filter 0.2s var(--ease-2);
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background-color: red;
    opacity: 0.5;
    mix-blend-mode: multiply;
    transition: opacirt 0.2s var(--ease-2);
    mask-image: url('@/assets/ui/board-small-card-slot.png');
    mask-size: cover;
  }
  &:hover {
    filter: drop-shadow(0 0 12px var(--red-5)) brightness(120%);
    &::after {
      opacity: 0.35;
    }
  }
}
</style>
