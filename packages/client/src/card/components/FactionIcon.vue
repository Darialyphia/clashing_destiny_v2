<script setup lang="ts">
import { assets } from '@/assets';
import {
  FACTIONS,
  type FactionId
} from '@game/engine/src/card/factions/factions';

const { factionId, size = 3 } = defineProps<{
  factionId: FactionId;
  // multiplier of the 13px pixel-art icon
  size?: number;
}>();

const faction = computed(() => FACTIONS[factionId]);
const src = computed(
  () => assets[`ui/card/v3/affinity-${faction.value.name.toLowerCase()}`]?.path
);
</script>

<template>
  <img
    class="faction-icon"
    :src="src"
    :alt="faction.name"
    :title="faction.name"
    :style="{ '--size': `${13 * size}px` }"
  />
</template>

<style scoped lang="postcss">
.faction-icon {
  width: var(--size);
  height: var(--size);
  image-rendering: pixelated;
  flex-shrink: 0;
}
</style>
