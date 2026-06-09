<script setup lang="ts">
import { useCollectionPage } from './useCollectionPage';
import DeckCardListItems from './DeckCardListItems.vue';

const { deckBuilder } = useCollectionPage();
</script>

<template>
  <div class="deck-cards">
    <DeckCardListItems
      :cards="deckBuilder.mainDeckCards"
      :deck-builder="deckBuilder"
    />
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
