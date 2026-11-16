<script setup lang="ts">
import { assets } from '@/assets';
import {
  FACTIONS,
  type FactionId
} from '@game/engine/src/card/factions/factions';

const { factionId } = defineProps<{
  factionId: FactionId;
}>();

const faction = computed(() => FACTIONS[factionId]);
const src = computed(
  () => assets[`ui/faction-crest-${faction.value.name.toLowerCase()}`]?.path
);
</script>

<template>
  <img
    class="faction-icon"
    :src="src"
    :alt="faction.name"
    :title="faction.name"
  />
</template>

<style scoped lang="postcss">
.faction-icon {
  width: calc(29px * var(--pixel-scale));
  aspect-ratio: 1;
  image-rendering: pixelated;
  flex-shrink: 0;
}
</style>
