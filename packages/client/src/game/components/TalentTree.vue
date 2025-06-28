<script setup lang="ts">
import type { PlayerViewModel } from '@game/engine/src/client/view-models/player.model';

const { player } = defineProps<{ player: PlayerViewModel }>();
</script>

<template>
  <div class="talent-tree"></div>
</template>

<style scoped lang="postcss">
.talent-tree {
  --pixel-scale: 2;
  aspect-ratio: var(--hero-ratio);
  max-height: calc(var(--pixel-scale) * var(--hero-height));
  background-color: black;
}
</style>
