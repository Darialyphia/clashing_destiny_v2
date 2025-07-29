<script setup lang="ts">
import type { PlayerViewModel } from '@game/engine/src/client/view-models/player.model';

const { player } = defineProps<{
  player: PlayerViewModel;
}>();
</script>

<template>
  <div class="unlocked-affinities">
    <div
      class="affinity"
      v-for="affinity in player.unlockedAffinities"
      :key="affinity"
      :style="{
        '--bg': `url(/assets/ui/affinity-${affinity.toLocaleLowerCase()}.png)`
      }"
    />
  </div>
</template>

<style scoped lang="postcss">
.unlocked-affinities {
  display: flex;
  gap: var(--size-2);
}

.affinity {
  aspect-ratio: 1;
  height: calc(var(--pixel-scale) * 25px);
  background-image: var(--bg);
  background-size: cover;
  background-position: center;
}
</style>
