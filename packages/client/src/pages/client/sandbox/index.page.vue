<script setup lang="ts">
import Sandbox from '@/game/components/Sandbox.vue';
import FancyButton from '@/ui/components/FancyButton.vue';
import PlayerDeck from '@/player/components/PlayerDeck.vue';
import { useDecks, type UserDeck } from '@/card/composables/useDecks';
import AuthenticatedHeader from '@/AuthenticatedHeader.vue';

definePage({
  name: 'Sandbox',
  path: '/client/sandbox'
});

const { data: decks, isLoading } = useDecks();

const p1Deck = ref<UserDeck | null>(null);
const p2Deck = ref<UserDeck | null>(null);
const isStarted = ref(false);
</script>

<template>
  <div v-if="!isStarted" class="flex flex-col h-full">
    <AuthenticatedHeader />
    <div class="deck-selector">
      <h1 class="text-3xl font-bold mb-4">Sandbox Mode</h1>
      <p class="mb-4">Choose decks for both players:</p>
      <p v-if="isLoading">Loading decks...</p>
      <div class="grid grid-cols-2 gap-4" v-if="decks">
        <ul class="flex flex-col gap-3">
          <li
            v-for="deck in decks"
            :key="deck.name"
            class="w-15"
            :class="{ selected: p1Deck?.id === deck.id }"
          >
            <PlayerDeck :deck="deck" @click="p1Deck = deck" />
          </li>
        </ul>
        <ul class="flex flex-col gap-3">
          <li
            v-for="deck in decks"
            :key="deck.name"
            class="w-15"
            :class="{ selected: p2Deck?.id === deck.id }"
          >
            <PlayerDeck :deck="deck" @click="p2Deck = deck" />
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
  </div>
  <Sandbox
    v-else-if="p1Deck && p2Deck"
    :players="[
      {
        id: 'p1',
        name: 'Player 1',
        spellSchools: p1Deck.spellSchools,
        mainDeck: {
          cards: p1Deck.mainDeck
            .map(c => Array.from({ length: c.copies }, () => c.blueprintId))
            .flat()
        },
        destinyDeck: {
          cards: p1Deck.destinyDeck
            .map(c => Array.from({ length: c.copies }, () => c.blueprintId))
            .flat()
        }
      },
      {
        id: 'p2',
        name: 'Player 2',
        spellSchools: p2Deck.spellSchools,
        mainDeck: {
          cards: p2Deck.mainDeck
            .map(c => Array.from({ length: c.copies }, () => c.blueprintId))
            .flat()
        },
        destinyDeck: {
          cards: p2Deck.destinyDeck
            .map(c => Array.from({ length: c.copies }, () => c.blueprintId))
            .flat()
        }
      }
    ]"
  />
</template>

<style lang="postcss" scoped>
.deck-selector {
  width: fit-content;
  margin-inline: auto;
}

.selected {
  filter: brightness(1.25);
  outline: solid 2px var(--primary);
  outline-offset: 5px;
}
</style>
