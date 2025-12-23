<script setup lang="ts">
import {
  CARD_KINDS,
  type CardKind,
  type Rune,
  RUNES
} from '@game/engine/src/card/card.enums';
import { useCollectionPage } from './useCollectionPage';
import { assets } from '@/assets';

const { deckBuilder } = useCollectionPage();
const getCountByKind = (kind: CardKind) => {
  return deckBuilder.value.cards
    .filter(c => c.blueprint.kind === kind)
    .reduce((acc, card) => {
      if ('copies' in card) {
        return acc + ((card.copies as number) ?? 1);
      }
      return acc + 1;
    }, 0);
};

const getHighestRuneCostByRune = (rune: Rune) => {
  let highestCost = 0;
  for (const item of deckBuilder.value.cards) {
    if (!('runeCost' in item.blueprint)) continue;
    const cost = item.blueprint.runeCost[rune] ?? 0;
    if (cost > highestCost) {
      highestCost = cost;
    }
  }
  return highestCost;
};
</script>

<template>
  <div class="flex">
    <div class="kind-counts">
      <div>
        <span>{{ getCountByKind(CARD_KINDS.MINION) }}</span>
        Minions
      </div>
      <div>
        <span>{{ getCountByKind(CARD_KINDS.SPELL) }}</span>
        Spells
      </div>
      <div>
        <span>{{ getCountByKind(CARD_KINDS.ARTIFACT) }}</span>
        Artifacts
      </div>
      <div>
        <span>{{ getCountByKind(CARD_KINDS.SIGIL) }}</span>
        Sigils
      </div>
    </div>
    <div class="rune-counts">
      <div
        v-for="rune in RUNES"
        :key="rune"
        :style="{
          '--bg': assets[`ui/card/rune-${rune.toLocaleLowerCase()}`].css
        }"
      >
        {{ getHighestRuneCostByRune(rune) }}
      </div>
    </div>
  </div>
</template>

<style scoped lang="postcss">
.kind-counts {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--size-2);
  justify-items: center;
  font-size: var(--font-size-00);
  margin-block: var(--size-1) var(--size-2);
  > div {
    display: flex;
    flex-direction: column;
    align-items: center;
    > span {
      font-size: var(--font-size-2);
      color: var(--primary);
      font-weight: var(--font-weight-5);
    }
  }
}

.rune-counts {
  flex-grow: 1;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--size-1);
  justify-items: center;
  margin-block: var(--size-1) var(--size-2);

  > div {
    width: calc(17px * 2);
    height: calc(18px * 2);
    background-image: var(--bg);
    background-size: cover;
    display: grid;
    place-content: center;
    -webkit-text-stroke: 4px black;
    paint-order: stroke fill;
    font-size: var(--font-size-2);
  }
}
</style>
