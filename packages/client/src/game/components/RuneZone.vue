<script setup lang="ts">
import type { PlayerViewModel } from '@game/engine/src/client/view-models/player.model';
import GameCard from './GameCard.vue';
import InspectableCard from '@/card/components/InspectableCard.vue';

const { player } = defineProps<{
  player: PlayerViewModel;
}>();
</script>

<template>
  <div class="rune-zone">
    <div v-for="card in player.runeZone" :key="card.id">
      <InspectableCard :card-id="card.id" side="top" align="center">
        <GameCard :card-id="card.id" variant="small" />
      </InspectableCard>
    </div>
  </div>
</template>

<style scoped lang="postcss">
.rune-zone {
  position: relative;
  height: var(--card-small-v3-height);
  width: 300px;
  > * {
    position: absolute;
    top: 0;
    left: calc((var(--child-index) - 1) * 50px);
  }
}
</style>
