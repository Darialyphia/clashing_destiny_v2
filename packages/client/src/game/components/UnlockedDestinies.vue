<script setup lang="ts">
import InspectableCard from '@/card/components/InspectableCard.vue';
import type { PlayerViewModel } from '@game/engine/src/client/view-models/player.model';

const { player } = defineProps<{ player: PlayerViewModel }>();
</script>

<template>
  <div class="flex gap-3">
    <InspectableCard
      v-for="card in player.getUnlockedDestinies()"
      :key="card.id"
      :card-id="card.id"
      :interactive="false"
    >
      <div class="destiny" :style="{ '--bg': `url(${card.imagePath})` }" />
    </InspectableCard>
  </div>
</template>

<style scoped lang="postcss">
.destiny {
  background: var(--bg);
  background-position: center;
  width: 48px;
  background-size: 96px;
  aspect-ratio: 1;
}
</style>
