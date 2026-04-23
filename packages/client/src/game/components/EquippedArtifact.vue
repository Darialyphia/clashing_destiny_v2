<script setup lang="ts">
import type { ArtifactViewModel } from '@game/engine/src/client/view-models/artifact.model';
import { useGameUi } from '../composables/useGameClient';
import ModifiersList from './ModifiersList.vue';
import GameCard from './GameCard.vue';

const { artifact } = defineProps<{
  artifact: ArtifactViewModel;
}>();

const ui = useGameUi();
</script>

<template>
  <div class="relative">
    <GameCard
      :card-id="artifact.card.id"
      variant="small"
      show-stats
      show-modifiers
      :overrides="{
        durability: artifact.durability
      }"
      @mouseenter="ui.hoverCardOnBoard(artifact.card)"
      @mouseleave="ui.unhoverCardOnBoard()"
    />

    <ModifiersList :modifiers="artifact.modifiers" />
  </div>
</template>

<style scoped lang="postcss"></style>
