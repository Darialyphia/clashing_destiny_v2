<script setup lang="ts">
import { CARD_KINDS, type CardKind } from '@game/engine/src/card/card.enums';
import { useCollectionPage } from './useCollectionPage';

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
</script>

<template>
  <div class="flex lt-lg:hidden">
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
</style>
