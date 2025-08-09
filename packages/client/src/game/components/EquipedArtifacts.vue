<script setup lang="ts">
import type { PlayerViewModel } from '@game/engine/src/client/view-models/player.model';
import {
  useBoardSide,
  useEntities,
  useGameClient,
  useGameState
} from '../composables/useGameClient';
import { CardViewModel } from '@game/engine/src/client/view-models/card.model';
import EquipedArtifact from './EquipedArtifact.vue';

const { player } = defineProps<{
  player: PlayerViewModel;
}>();

const boardSide = useBoardSide(computed(() => player.id));
const artifacts = useEntities<CardViewModel>(
  computed(() => boardSide.value.heroZone.artifacts)
);

const state = useGameState();
const emptySlots = computed(() => {
  return state.value.config.MAX_EQUIPPED_ARTIFACTS - artifacts.value.length;
});
const client = useGameClient();
</script>

<template>
  <div
    class="equiped-artifacts"
    :class="{ 'ui-hidden': !client.ui.displayedElements.artifacts }"
  >
    <EquipedArtifact
      v-for="artifact in artifacts"
      :key="artifact.id"
      :artifact="artifact"
    />
    <div class="empty-slot" v-for="i in emptySlots" :key="i" />
  </div>
</template>

<style scoped lang="postcss">
.equiped-artifacts {
  display: flex;
  gap: var(--size-3);
  margin-top: var(--size-3);
}

.empty-slot {
  --pixel-scale: 1;
  aspect-ratio: var(--artifact-ratio);
  background-image: url(/assets/ui/artifact-empty.png);
  background-position: center;
  background-size: calc(96px * var(--pixel-scale))
    calc(96px * var(--pixel-scale));
  height: calc(var(--artifact-height) * var(--pixel-scale));
}
</style>
