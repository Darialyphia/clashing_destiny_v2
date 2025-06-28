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
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--size-4);
  padding-block: var(--size-1);
}

.affinity {
  aspect-ratio: 1;
  max-height: calc(var(--pixel-scale) * 25px);
  background-image: var(--bg);
  background-size: cover;
  background-position: center;
}
</style>
