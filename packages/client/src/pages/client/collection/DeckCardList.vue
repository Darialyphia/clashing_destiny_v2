<script setup lang="ts">
import DeckCardListItem from './DeckCardListItem.vue';
import { useCollectionPage } from './useCollectionPage';

const { deckBuilder, deckEditorOptions } = useCollectionPage();

const cards = computed(() => {
  if (!deckEditorOptions.value.collapseFoil)
    return deckBuilder.value.mainDeckCards;
  // group foil ans non foil cards who share the same blueprint id
  // if a card only has a foil version, change isFoil to false
  const groupedCards: Record<string, typeof deckBuilder.value.mainDeckCards> =
    {};
  for (const card of deckBuilder.value.mainDeckCards) {
    const id = card.blueprint.id;
    if (!groupedCards[id]) groupedCards[id] = [];
    groupedCards[id].push(card);
  }

  const result: typeof deckBuilder.value.mainDeckCards = [];
  for (const group of Object.values(groupedCards)) {
    const nonFoil = group.find(card => !card.meta.isFoil);
    if (nonFoil) {
      result.push({
        ...nonFoil,
        copies: group.reduce((sum, card) => sum + card.copies, 0)
      });
    } else {
      const foilCard = group[0];
      result.push({ ...foilCard, meta: { ...foilCard.meta, isFoil: false } });
    }
  }

  return result;
});
</script>

<template>
  <div class="deck-cards">
    <ul class="overflow-y-auto fancy-scrollbar">
      <DeckCardListItem
        v-for="(card, index) in cards"
        :key="index"
        :card="card"
      />
    </ul>
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
