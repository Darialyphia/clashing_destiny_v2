<script setup lang="ts">
import Sandbox from '@/game/components/Sandbox.vue';
import { premadeDecks } from '@/utils/premade-decks';
import type { ValidatableDeck } from '@game/engine/src/card/validators/deck.validator';
import { useLocalStorage } from '@vueuse/core';
import FancyButton from '@/ui/components/FancyButton.vue';
import type { DisplayedDeck } from '@/player/components/PlayerDeck.vue';
import PlayerDeck from '@/player/components/PlayerDeck.vue';

definePage({
  name: 'Sandbox'
});

const decks = useLocalStorage<ValidatableDeck[]>(
  'clashing-destinies-decks',
  []
);

type DeckChoice = {
  id: string;
  mainDeck: { cards: string[] };
  destinyDeck: { cards: string[] };
  deck: DisplayedDeck;
};
const choices = computed<DeckChoice[]>(() => {
  return [
    ...premadeDecks.map((deck, index) => ({
      id: `premade-${index}`,
      label: deck.name,
      mainDeck: deck.mainDeck,
      destinyDeck: deck.destinyDeck,
      deck: {
        name: deck.name,
        mainDeck: deck.mainDeck.cards.map(card => ({
          blueprintId: card
        }))
      }
    })),
    ...decks.value.map((deck, index) => ({
      id: `custom-${index}`,
      label: deck.name,
      destinyDeck: {
        cards: deck.destinyDeck.map(card => card.blueprintId)
      },
      mainDeck: {
        cards: deck.mainDeck.flatMap(card =>
          Array.from({ length: card.copies }, () => card.blueprintId)
        )
      },
      deck
    }))
  ];
});
const p1Deck = ref<DeckChoice | null>(null);
const p2Deck = ref<DeckChoice | null>(null);
const isStarted = ref(false);
</script>

<template>
  <div
    v-if="!isStarted"
    class="flex flex-col items-center justify-center h-full"
  >
    <header>
      <nav>
        <ul class="flex gap-4">
          <li>
            <RouterLink :to="{ name: 'Home' }">Home</RouterLink>
          </li>
          <li>
            <RouterLink :to="{ name: 'Collection' }">Collection</RouterLink>
          </li>
        </ul>
      </nav>
    </header>
    <h1 class="text-3xl font-bold mb-4">Sandbox Mode</h1>
    <p class="mb-4">Choose decks for both players:</p>
    <div class="grid grid-cols-2 gap-4">
      <ul class="flex flex-col gap-3">
        <li
          v-for="choice in choices"
          :key="choice.deck.name"
          :class="{ selected: p1Deck?.id === choice.id }"
        >
          <PlayerDeck :deck="choice.deck" @click="p1Deck = choice" />
        </li>
      </ul>
      <ul class="flex flex-col gap-3">
        <li
          v-for="choice in choices"
          :key="choice.deck.name"
          :class="{ selected: p2Deck?.id === choice.id }"
        >
          <PlayerDeck :deck="choice.deck" @click="p2Deck = choice" />
        </li>
      </ul>
    </div>
    <FancyButton
      class="mt-4"
      text="Start Game"
      :disabled="!p1Deck || !p2Deck"
      @click="isStarted = true"
    />
  </div>
  <Sandbox
    v-else-if="p1Deck && p2Deck"
    :players="[
      {
        id: 'p1',
        name: 'Player 1',
        mainDeck: p1Deck.mainDeck,
        destinyDeck: p1Deck.destinyDeck
      },
      {
        id: 'p2',
        name: 'Player 2',
        mainDeck: p2Deck.mainDeck,
        destinyDeck: p2Deck.destinyDeck
      }
    ]"
  />
</template>

<style lang="postcss" scoped>
.selected {
  filter: brightness(1.25);
  outline: solid 2px var(--primary);
  outline-offset: 5px;
}
</style>
