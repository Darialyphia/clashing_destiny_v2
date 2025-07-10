<script setup lang="ts">
import type { PlayerViewModel } from '@game/engine/src/client/view-models/player.model';
import { useBoardSide, useEntities } from '../composables/useGameClient';
import { CardViewModel } from '@game/engine/src/client/view-models/card.model';
import InspectableCard from '@/card/components/InspectableCard.vue';

const { player } = defineProps<{
  player: PlayerViewModel;
}>();

const boardSide = useBoardSide(computed(() => player.id));
const artifacts = useEntities<CardViewModel>(
  computed(() => boardSide.value.heroZone.artifacts)
);
</script>

<template>
  <div class="equiped-artifacts">
    <InspectableCard
      v-for="artifact in artifacts"
      :key="artifact.id"
      :card-id="artifact.id"
    >
      <div
        class="artifact"
        :style="{
          '--bg': `url(${artifact.imagePath})`
        }"
      />
    </InspectableCard>
  </div>
</template>

<style scoped lang="postcss">
.equiped-artifacts {
  display: flex;
  flex-direction: column;
  gap: var(--size-2);
}

.artifact {
  --pixel-scale: 1;
  aspect-ratio: var(--artifact-ratio);
  background-image: var(--bg);
  background-position: center;
  background-size: calc(96px * var(--pixel-scale))
    calc(96px * var(--pixel-scale));
  height: calc(var(--artifact-height) * var(--pixel-scale));
}
</style>
