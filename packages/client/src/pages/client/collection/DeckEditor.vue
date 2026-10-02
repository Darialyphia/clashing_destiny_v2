<script setup lang="ts">
import DeckHeader from './DeckHeader.vue';
import ManaCurveChart from '@/player/components/ManaCurveChart.vue';
import CardTypeStats from './CardTypeStats.vue';
import DeckCardList from './DeckCardList.vue';
import DeckFooter from './DeckFooter.vue';
import { useCollectionPage } from './useCollectionPage';

const { deckBuilder } = useCollectionPage();
</script>

<template>
  <div class="deck">
    <div>
      <DeckHeader />
      <ManaCurveChart :deck-builder="deckBuilder" class="mana-curve" />
      <CardTypeStats />
    </div>
    <DeckCardList />
    <DeckFooter />
  </div>
</template>

<style scoped lang="postcss">
.deck {
  display: grid;
  grid-template-rows: auto 1fr auto;
  height: 100%;
}

.mana-curve {
  height: var(--size-11);
}
</style>
