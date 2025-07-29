<script setup lang="ts">
import type { PlayerViewModel } from '@game/engine/src/client/view-models/player.model';
import { useBoardSide, useEntities } from '../composables/useGameClient';
import { CardViewModel } from '@game/engine/src/client/view-models/card.model';
import EquipedArtifact from './EquipedArtifact.vue';

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
    <EquipedArtifact
      v-for="artifact in artifacts"
      :key="artifact.id"
      :artifact="artifact"
    />
  </div>
</template>

<style scoped lang="postcss">
.equiped-artifacts {
  display: flex;
  gap: var(--size-3);
  margin-top: var(--size-3);
}
</style>
