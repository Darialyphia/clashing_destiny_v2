<script setup lang="ts">
import PlayerDeck from '@/player/components/PlayerDeck.vue';
import { useCollectionPage } from './useCollectionPage';
import FancyButton from '@/ui/components/FancyButton.vue';

const { decks, createDeck, editDeck } = useCollectionPage();
</script>

<template>
  <p v-if="!decks.length" class="text-center text-4 mt-6">
    You haven't created any deck.
  </p>
  <ul class="mb-5">
    <li v-for="(deck, index) in decks" :key="index">
      <PlayerDeck :deck="deck" @click="editDeck(deck)" />
    </li>
  </ul>
  <FancyButton
    class="primary-button"
    :class="!decks.length && 'mx-auto'"
    text="New Deck"
    @click="createDeck"
  />
</template>
