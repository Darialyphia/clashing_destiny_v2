<script setup lang="ts">
import { useCollectionPage } from './useCollectionPage';
import FancyButton from '@/ui/components/FancyButton.vue';

const { decks, createDeck, editDeck } = useCollectionPage();
</script>

<template>
  <p v-if="!decks.length" class="text-center text-4 mt-6">
    You haven't created any deck.
  </p>
  <ul class="mb-5">
    <li
      v-for="(deck, index) in decks"
      :key="index"
      class="flex gap-2 items-center"
    >
      <button class="flex-1 text-left" @click="editDeck(deck)">
        {{ deck.name }}
      </button>

      <FancyButton
        variant="error"
        text="Delete"
        @click="decks.splice(decks.indexOf(deck), 1)"
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

<style scoped lang="postcss"></style>
