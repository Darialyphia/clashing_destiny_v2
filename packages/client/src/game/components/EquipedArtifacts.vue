<script setup lang="ts">
import type { PlayerViewModel } from '@game/engine/src/client/view-models/player.model';
import { useBoardSide, useEntities } from '../composables/useGameClient';
import { CardViewModel } from '@game/engine/src/client/view-models/card.model';

const { player } = defineProps<{
  player: PlayerViewModel;
}>();

const boardSide = useBoardSide(computed(() => player.id));
const artifacts = useEntities<CardViewModel>(
  computed(() => boardSide.value.heroZone.artifacts)
);
</script>

<template>
  <div class="grid cols-3 gap-4 py-3">
    <div
      class="artifact"
      v-for="artifact in artifacts"
      :key="artifact.id"
      :style="{
        '--bg': `url(${artifact.imagePath})`
      }"
    />
  </div>
</template>

<style scoped lang="postcss">
.artifact {
  aspect-ratio: var(--artifact-ratio);
  background-image: var(--bg);
  background-position: center;
}
</style>
