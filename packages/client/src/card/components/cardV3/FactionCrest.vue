<script setup lang="ts">
import type { FactionId } from '@game/engine/src/card/factions/factions';
import FactionIcon from '../FactionIcon.vue';

const { faction } = defineProps<{
  faction: FactionId;
}>();
</script>

<template>
  <div class="faction-crest parallax">
    <FactionIcon :factionId="faction" />
  </div>
</template>

<style scoped lang="postcss">
.faction-crest {
  position: absolute;
  top: calc(-2px * var(--pixel-scale));
  right: 0;
}
</style>
