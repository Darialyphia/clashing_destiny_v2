<script setup lang="ts">
import BlueprintCard from '@/card/components/BlueprintCard.vue';
import type { CardBlueprint } from '@game/engine/src/card/card-blueprint';
import { CARDS_DICTIONARY } from '@game/engine/src/card/sets';

const selectedCard = ref<CardBlueprint | null>();
</script>

<template>
  <div>
    <BlueprintCard
      v-if="selectedCard"
      :blueprint="selectedCard"
      :is-foil="true"
    />
  </div>
</template>

<style scoped lang="postcss"></style>
