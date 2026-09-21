<script setup lang="ts">
import FancyButton from '@/ui/components/FancyButton.vue';
import PlayerDeck from '@/player/components/PlayerDeck.vue';
import { useDecks, type UserDeck } from '@/card/composables/useDecks';

const emit = defineEmits<{
  start: [];
}>();
const { data: decks, isLoading } = useDecks();

const p1Deck = defineModel<UserDeck | null>('p1Deck', { required: true });
const p2Deck = defineModel<UserDeck | null>('p2Deck', { required: true });

const validDecks = computed(() => {
  if (!decks.value) return [];
  return decks.value.filter(deck => deck.isValid.result === 'success');
});
</script>

<template>
  <div class="deck-selector">
    <p v-if="isLoading">Loading decks...</p>
    <p v-if="!validDecks.length">
      You don't have any valid decks yet. Create some decks in the Deck Builder
      to get started!
    </p>
    <div class="grid grid-cols-2 gap-4" v-if="decks">
      <ul class="flex flex-col gap-3">
        <li
          v-for="deck in validDecks"
          :key="deck.name"
          class="w-15"
          :class="{ selected: p1Deck?.id === deck.id }"
        >
          <PlayerDeck :deck="deck" @click="p1Deck = deck" />
        </li>
      </ul>
      <ul class="flex flex-col gap-3">
        <li
          v-for="deck in validDecks"
          :key="deck.name"
          class="w-15"
          :class="{ selected: p2Deck?.id === deck.id }"
        >
          <PlayerDeck :deck="deck" @click="p2Deck = deck" />
        </li>
      </ul>
    </div>
    <FancyButton
      class="mt-4 mx-auto"
      text="Start Game"
      size="lg"
      :disabled="!p1Deck || !p2Deck"
      @click="emit('start')"
    />
  </div>
</template>

<style lang="postcss" scoped>
.deck-selector {
  width: fit-content;
  margin-inline: auto;
  transition: all 0.25s var(--ease-3);
  @starting-style {
    opacity: 0;
    scale: 1.5;
  }
}

.selected {
  filter: brightness(1.25);
  outline: solid 2px var(--primary);
  outline-offset: 5px;
}
</style>
