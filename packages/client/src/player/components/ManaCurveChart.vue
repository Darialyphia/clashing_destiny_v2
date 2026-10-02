<script setup lang="ts">
import type { DeckBuilderViewModel } from '@/card/deck-builder.model';

const { deckBuilder } = defineProps<{ deckBuilder: DeckBuilderViewModel }>();

const highestCount = computed(() =>
  Math.max(
    ...Array.from({ length: 7 }, (_, i) =>
      i === 6 ? getCountForCostAndUp(i) : getCountForCost(i)
    )
  )
);

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
    deckBuilder.mainDeckCards.filter(c => {
      if ('manaCost' in c.blueprint) {
        return c.blueprint.manaCost === cost;
      }
      return false;
    })
  );

const getCountForCostAndUp = (minCost: number) =>
  getCount(
    deckBuilder.mainDeckCards.filter(c => {
      if ('manaCost' in c.blueprint) {
        return (c.blueprint.manaCost ?? 0) >= minCost;
      }
      return false;
    })
  );
</script>

<template>
  <div class="bars lt-lg:hidden" :style="{ '--highest': highestCount }">
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
@layer components {
  .bars {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 2px;
    margin-top: var(--size-2);
    padding: 3px 3px 0;
    border: solid 2px #3b211d;
    border-top-color: #c18b4d;
    background:
      linear-gradient(
        hsl(var(--gray-12-hsl) / 0.35),
        hsl(var(--gray-12-hsl) / 0.35)
      ),
      repeating-linear-gradient(0deg, #24171a 0 2px, #2d1c1c 2px 4px);
    overflow: hidden;
    > div {
      display: grid;
      grid-template-rows: 1fr auto;
      gap: 2px;
      min-width: 0;
    }
  }

  .cost {
    display: grid;
    place-content: center;
    min-height: 24px;
    color: #f8eabb;
    background: url('@/assets/ui/card/v3/mana-cost.png') center / 22px 22px
      no-repeat;
    font-size: var(--font-size-00);
    font-weight: var(--font-weight-8);
    -webkit-text-stroke: 4px #241313;
    paint-order: stroke fill;
    filter: drop-shadow(0 1px 0 #12090b);
  }

  .bar {
    --percent: calc(1% * (var(--count) * 100 / var(--highest)) - 20px);

    position: relative;
    min-height: 32px;
    border: 1px solid hsl(var(--yellow-7-hsl) / 0.18);
    background:
      linear-gradient(
        to top,
        #d6a83c 0%,
        #f4d878 8%,
        #9d682a var(--percent),
        hsl(var(--gray-12-hsl) / 0.72) var(--percent)
      ),
      repeating-linear-gradient(
        90deg,
        transparent 0 3px,
        hsl(var(--yellow-3-hsl) / 0.04) 3px 4px
      );
    background-blend-mode: normal, screen;

    &:not([data-count='0'])::after {
      content: attr(data-count);

      position: absolute;
      bottom: var(--percent);
      left: 50%;
      transform: translateX(-50%);
      color: #f8eabb;
      font-size: var(--font-size-0);
      font-weight: var(--font-weight-8);
      -webkit-text-stroke: 2px #241313;
      paint-order: stroke fill;
      filter: drop-shadow(0 1px 0 #12090b);
    }
  }
}
</style>
