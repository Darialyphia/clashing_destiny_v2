<script setup lang="ts">
import CardBack from '@/card/components/CardBack.vue';
import { useBoardSide, useGameClient } from '../composables/useGameClient';
import InspectableCard from '@/card/components/InspectableCard.vue';

const { playerId } = defineProps<{ playerId: string }>();

const boardSide = useBoardSide(playerId);

const client = useGameClient();
</script>

<template>
  <div class="destiny-zone">
    <template v-if="client.playerId === playerId">
      <InspectableCard
        v-for="card in boardSide.destinyZone"
        :key="card"
        :card-id="card"
        side="top"
      >
        <CardBack :key="card" class="item" />
      </InspectableCard>
    </template>
    <template v-else>
      <CardBack
        v-for="card in boardSide.destinyZone"
        :key="card"
        class="item"
      />
    </template>
  </div>
</template>

<style scoped lang="postcss">
.destiny-zone {
  display: flex;
}

.item {
  aspect-ratio: var(--card-ratio);
  height: 100%;
}
</style>
