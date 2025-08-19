<script setup lang="ts">
import { useCollectionPage } from './useCollectionPage';
import FancyButton from '@/ui/components/FancyButton.vue';
import { AFFINITIES, type Affinity } from '@game/engine/src/card/card.enums';
import { CARDS_DICTIONARY } from '@game/engine/src/card/sets';
import type { ValidatableDeck } from '@game/engine/src/card/validators/deck.validator';

const { decks, createDeck, editDeck } = useCollectionPage();

const getDeckAffinities = (deck: ValidatableDeck) => {
  const result = new Set<Affinity>();

  deck.mainDeck.forEach(card => {
    const blueprint = CARDS_DICTIONARY[card.blueprintId];
    if (!blueprint) return;

    if (blueprint.affinity !== AFFINITIES.NORMAL) {
      result.add(blueprint.affinity);
    }
  });

  return Array.from(result);
};

const getDeckHero = (deck: ValidatableDeck) => {
  return deck.hero ? CARDS_DICTIONARY[deck.hero] : null;
};
</script>

<template>
  <p v-if="!decks.length" class="text-center text-4 mt-6">
    You haven't created any deck.
  </p>
  <ul class="mb-5">
    <li
      v-for="(deck, index) in decks"
      :key="index"
      :style="{
        '--bg': `url(/assets/icons/${getDeckHero(deck)?.cardIconId}.png)`
      }"
    >
      <button class="deck-item" @click="editDeck(deck)">
        {{ deck.name }}
      </button>

      <div
        v-for="affinity in getDeckAffinities(deck)"
        :key="affinity"
        class="deck-affinity"
        :style="{
          '--bg': `url('/assets/ui/affinity-${affinity.toLowerCase()}.png')`
        }"
      />
    </li>
  </ul>
  <FancyButton
    class="primary-button"
    :class="!decks.length && 'mx-auto'"
    text="New Deck"
    @click="createDeck"
  />
</template>

<style scoped lang="postcss">
li {
  display: flex;
  gap: var(--size-2);
  align-items: center;
  background-image: linear-gradient(
      to right,
      hsl(0deg 0% 0% / 0.5),
      hsl(0deg 0% 0% / 0.5)
    ),
    var(--bg);
  background-repeat: no-repeat;
  background-position:
    center center,
    left center;
  background-size: 200%, calc(2px * 96);
  border: solid 1px var(--primary);
  padding: var(--size-2);
}

.deck-item {
  flex: 1 1 0%;
  text-align: left;
  align-self: stretch;
  font-size: var(--font-size-3);
  font-weight: var(--font-weight-7);
  text-shadow: 0 0 1rem 1rem black;
  -webkit-text-stroke: 3px black;
  paint-order: stroke fill;
}

.deck-affinity {
  background: var(--bg);
  background-size: cover;
  background-position: center;
  width: calc(1 * 26px);
  height: calc(1 * 28px);
}
</style>
