<script setup lang="ts">
import DeckHeader from './DeckHeader.vue';
import ManaCurveChart from './ManaCurveChart.vue';
import CardTypeStats from './CardTypeStats.vue';
import DeckCardList from './DeckCardList.vue';
import DeckFooter from './DeckFooter.vue';
</script>

<template>
  <div class="deck">
    <div>
      <DeckHeader />
      <ManaCurveChart />
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
</style>
