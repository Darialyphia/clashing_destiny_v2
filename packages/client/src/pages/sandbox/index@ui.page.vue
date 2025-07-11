<script setup lang="ts">
import Sandbox from '@/game/components/Sandbox.vue';
import { premadeDecks } from '@/utils/premade-decks';
import type { ValidatableDeck } from '@game/engine/src/card/validators/deck.validator';
import { useLocalStorage } from '@vueuse/core';
import FancyButton from '@/ui/components/FancyButton.vue';

definePage({
  name: 'Sandbox'
});

const decks = useLocalStorage<ValidatableDeck[]>(
  'clashing-destinies-decks',
  []
);

type DeckChoice = {
  label: string;
  mainDeck: { cards: string[] };
  destinyDeck: { cards: string[] };
};
const choices = computed(() => {
  return [
    ...premadeDecks.map(deck => ({
      label: deck.name,
      mainDeck: deck.mainDeck,
      destinyDeck: deck.destinyDeck
    })),
    ...decks.value.map(deck => ({
      label: deck.name,
      mainDeck: {
        cards: deck.mainDeck.flatMap(card =>
          Array.from({ length: card.copies }, () => card.blueprintId)
        )
      },
      destinyDeck: {
        cards: deck.destinyDeck.flatMap(card =>
          Array.from({ length: card.copies }, () => card.blueprintId)
        )
      }
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
    <div class="flex gap-4">
      <select v-model="p1Deck" class="border p-2 rounded">
        <option v-for="choice in choices" :key="choice.label" :value="choice">
          {{ choice.label }}
        </option>
      </select>
      <select v-model="p2Deck" class="border p-2 rounded">
        <option v-for="choice in choices" :key="choice.label" :value="choice">
          {{ choice.label }}
        </option>
      </select>
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
        destinyDeck: p1Deck.destinyDeck,
        mainDeck: p1Deck.mainDeck
      },
      {
        id: 'p2',
        name: 'Player 2',
        destinyDeck: p2Deck.destinyDeck,
        mainDeck: p2Deck.mainDeck
      }
    ]"
  />
</template>

<style scoped lang="postcss"></style>
