<script setup lang="ts">
import type { PlayerViewModel } from '@game/engine/src/client/view-models/player.model';
import UnlockedDestiny from './UnlockedDestiny.vue';

const { player } = defineProps<{ player: PlayerViewModel }>();
</script>

<template>
  <div class="grid grid-cols-4 gap-3">
    <UnlockedDestiny
      v-for="destiny in player.getUnlockedDestinies()"
      :key="destiny.id"
      :destiny="destiny"
    />
  </div>
</template>
