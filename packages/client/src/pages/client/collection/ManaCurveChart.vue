<script setup lang="ts">
import { useCollectionPage } from './useCollectionPage';

const { deckBuilder } = useCollectionPage();

const getCount = (cards: Array<{ copies: number }>) => {
  return cards.reduce((acc, card) => {
    if ('copies' in card) {
      return acc + ((card.copies as number) ?? 1);
    }
    return acc + 1;
  }, 0);
};

const getCountForCost = (cost: number) =>
  getCount(
    deckBuilder.value.mainDeckCards.filter(c => c.blueprint.manaCost === cost)
  );

const getCountForCostAndUp = (minCost: number) =>
  getCount(
    deckBuilder.value.mainDeckCards.filter(c => c.blueprint.manaCost >= minCost)
  );
</script>

<template>
  <div class="bars" :style="{ '--total': deckBuilder.mainDeckSize }">
    <div
      v-for="i in 7"
      :key="i"
      :style="{
        '--count':
          i === 7 ? getCountForCostAndUp(i - 1) : getCountForCost(i - 1)
      }"
    >
      <div class="bar" :data-count="getCountForCost(i - 1)" />
      <div class="cost">{{ i === 7 ? '6+' : i - 1 }}</div>
    </div>
  </div>
</template>

<style scoped lang="postcss">
.bars {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: var(--size-1);
  height: var(--size-10);
  margin-top: var(--size-2);

  > div {
    display: grid;
    grid-template-rows: 1fr auto;
    gap: var(--size-1);
  }
}

.cost {
  display: grid;
  place-content: center;
  color: var(--primary);
}

.bar {
  --percent: calc(1% * (var(--count) * 100 / var(--total)));

  position: relative;
  background: linear-gradient(
    to top,
    var(--primary) 0%,
    var(--primary) var(--percent),
    hsl(var(--gray-12-hsl) / 0.5) var(--percent)
  );

  &:not([data-count='0'])::after {
    content: attr(data-count);

    position: absolute;
    bottom: var(--percent);
    left: 50%;
    transform: translateX(-50%);

    font-size: var(--font-size-0);
  }
}
</style>
