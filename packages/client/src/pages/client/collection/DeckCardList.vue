<script setup lang="ts">
import DeckCardListItems from './DeckCardListItems.vue';
</script>

<template>
  <div class="deck-cards">
    <DeckCardListItems />
  </div>
</template>

<style scoped lang="postcss">
.deck-cards {
  overflow-y: hidden;
  display: flex;
  flex-direction: column;
  display: grid;
  grid-template-rows: auto 1fr;
}
</style>
