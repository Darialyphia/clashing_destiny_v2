<script setup lang="ts">
import {
  HoverCardRoot,
  HoverCardTrigger,
  HoverCardPortal,
  HoverCardContent
} from 'reka-ui';
import BlueprintCard from '@/card/components/BlueprintCard.vue';
import { assets } from '@/assets';
import type { CardBlueprint } from '@game/engine/src/card/card-blueprint';
import { useCollectionPage } from './useCollectionPage';

const { deckBuilder, deckEditorOptions } = useCollectionPage();

const getCardBg = (card: CardBlueprint) => {
  const main = assets[`cards/${card.art.default.main}`];
  if (main) return main.css;
  const sprite = assets[`cards/${card.art.default.sprite}`];
  if (sprite) return sprite.css;

  return '';
};

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
      result.push(nonFoil);
    } else {
      const foilCard = group[0];
      result.push({ ...foilCard, meta: { ...foilCard.meta, isFoil: false } });
    }
  }

  return result;
});
</script>

<template>
  <ul class="overflow-y-auto fancy-scrollbar">
    <HoverCardRoot
      :open-delay="100"
      :close-delay="0"
      v-for="(card, index) in cards"
      :key="index"
    >
      <HoverCardTrigger v-bind="$attrs" as-child>
        <li
          :style="{
            '--bg': getCardBg(card.blueprint)
          }"
          :class="card.blueprint.kind.toLocaleLowerCase()"
          class="deck-item"
          @click="deckBuilder.removeCard(card.meta!.cardId)"
        >
          <div class="mana-cost" v-if="'manaCost' in card.blueprint">
            {{ card.blueprint.manaCost }}
          </div>
          <span class="card-name">
            <template v-if="'copies' in card">X {{ card.copies }}</template>
            {{ card.blueprint.name }}
          </span>
          <div class="flex gap-1 items-center ml-auto">
            <div
              v-for="affinity in card.blueprint.affinities"
              :key="affinity"
              class="affinity"
              :style="{
                '--bg':
                  assets[`ui/card/v3/affinity-${affinity.toLocaleLowerCase()}`]
                    .css
              }"
            />
          </div>
        </li>
      </HoverCardTrigger>
      <HoverCardPortal>
        <HoverCardContent side="left" :side-offset="10">
          <BlueprintCard
            :blueprint="card.blueprint"
            style="--pixel-scale: 2"
            :is-foil="card.meta.isFoil"
          />
        </HoverCardContent>
      </HoverCardPortal>
    </HoverCardRoot>
  </ul>
</template>

<style scoped lang="postcss">
.deck-item {
  display: flex;
  gap: var(--size-2);
  align-items: center;
  border: solid var(--border-size-1) #d7ad42;
  padding: var(--size-2) var(--size-3);
  cursor: url('@/assets/ui/cursor-hover.png'), auto;
  background-image:
    linear-gradient(to right, #0c0c0c 25%, transparent), var(--bg);
  background-repeat: no-repeat;
  background-position:
    center center,
    calc(100% + 40px) -35px;
  background-size: cover, calc(2px * 96);
  transition: transform 0.3s var(--ease-2);

  @starting-style {
    opacity: 0;
    transform: translateX(-3rem);
  }
}

.mana-cost {
  background: url(@/assets/ui/card/v3/mana-cost.png) no-repeat center center;
  background-size: contain;
  font-size: var(--size-3);
  font-weight: var(--font-weight-5);
  width: 29px;
  aspect-ratio: 1;
  display: grid;
  place-content: center;
  -webkit-text-stroke: 4px black;
  paint-order: stroke fill;
  padding-right: 1px;
}

.exp-cost {
  background: url(@/assets/ui/card/exp-cost.png) no-repeat center center;
  background-size: contain;
  font-size: var(--size-3);
  font-weight: var(--font-weight-5);
  width: 24px;
  aspect-ratio: 1;
  display: grid;
  place-content: center;
  -webkit-text-stroke: 4px black;
  paint-order: stroke fill;
  padding-right: 1px;
}

.card-name {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  -webkit-text-stroke: 4px black;
  paint-order: stroke fill;
}

.affinity {
  width: 13px;
  aspect-ratio: 1;
  background: var(--bg);
  background-size: cover;
}
</style>
