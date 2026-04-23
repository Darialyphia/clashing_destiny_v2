<script setup lang="ts">
import { useMyPlayer } from '../composables/useGameClient';
import EquippedArtifact from './EquippedArtifact.vue';

import Hero from './Hero.vue';

const player = useMyPlayer();
</script>

<template>
  <div class="my-hero-zone">
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
.my-hero-zone {
  display: flex;
  gap: 15px;
}

.zone {
  width: 148px;
  height: 130px;
  background: url('@/assets/ui/board-small-card-slot-empty.png') no-repeat
    center;
}
</style>
