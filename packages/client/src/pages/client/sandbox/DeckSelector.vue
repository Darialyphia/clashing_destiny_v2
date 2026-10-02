<script setup lang="ts">
import FancyButton from '@/ui/components/FancyButton.vue';
import PlayerDeckCard from '@/player/components/PlayerDeckCard.vue';
import { useDecks, type UserDeck } from '@/card/composables/useDecks';

const emit = defineEmits<{
  start: [];
}>();
const { data: decks, isLoading } = useDecks();

const p1Deck = defineModel<UserDeck | null>('p1Deck', { required: true });
const p2Deck = defineModel<UserDeck | null>('p2Deck', { required: true });

let player = 1;
const selectDeck = (deck: UserDeck) => {
  if (player === 1) {
    p1Deck.value = deck;
    player = 2;
  } else {
    p2Deck.value = deck;
    player = 1;
  }
};
</script>

<template>
  <div class="deck-selector">
    <p v-if="isLoading">Loading decks...</p>
    <p v-else-if="!decks.length">
      You don't have any deck ready. Create some decks in the Deck Builder to
      get started!
    </p>
    <ul class="flex gap-3 flex-wrap justify-center">
      <li
        v-for="deck in decks"
        :key="deck.name"
        :class="{
          'selected-p1': p1Deck?.id === deck.id,
          'selected-p2': p2Deck?.id === deck.id
        }"
      >
        <PlayerDeckCard
          :deck="deck"
          @click="
            () => {
              if (deck.isValid.result === 'success') {
                selectDeck(deck);
              }
            }
          "
        />
        <div class="p1-indicator">P1</div>
        <div class="p2-indicator">P2</div>
      </li>
    </ul>
    <FancyButton
      class="mt-8 mx-auto"
      text="Start Game"
      size="lg"
      :disabled="!p1Deck || !p2Deck"
      @click="emit('start')"
    />
  </div>
</template>

<style lang="postcss" scoped>
.deck-selector {
  width: var(--size-lg);
  margin-inline: auto;
}

li {
  position: relative;
  transition: all 0.25s var(--ease-3);
  transition-delay: calc(0.05s * sibling-index());
  @starting-style {
    opacity: 0;
    scale: 1.5;
  }
}
.p1-indicator,
.p2-indicator {
  display: none;
}

.selected-p1:not(.selected-p2) {
  position: relative;
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(var(--blue-3), var(--blue-8));
    mask-image: url(@/assets/ui/card/v3/deck.png);
    mask-size: cover;
    transform-origin: center;
    scale: 1.05;
    z-index: -1;
  }

  .p1-indicator {
    position: absolute;
    top: 100%;
    left: 50%;
    display: block;
    transform: translateX(-50%);
    background-color: var(--blue-8);
    color: var(--red-1);
    padding: var(--size-1) var(--size-2);
    font-weight: bold;
  }
}

.selected-p2:not(.selected-p1) {
  position: relative;
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(var(--red-3), var(--red-8));
    mask-image: url(@/assets/ui/card/v3/deck.png);
    mask-size: cover;
    transform-origin: center;
    scale: 1.05;
    z-index: -1;
  }

  .p2-indicator {
    position: absolute;
    top: 100%;
    left: 50%;
    display: block;
    transform: translateX(-50%);
    background-color: var(--red-8);
    color: var(--red-1);
    padding: var(--size-1) var(--size-2);
    font-weight: bold;
  }
}

.selected-p1.selected-p2 {
  position: relative;
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(var(--blue-3), var(--blue-8));
    mask-image: url(@/assets/ui/card/v3/deck.png);
    mask-size: cover;
    transform-origin: center;
    scale: 1.1;
    z-index: -1;
  }
  position: relative;
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(var(--red-3), var(--red-8));
    mask-image: url(@/assets/ui/card/v3/deck.png);
    mask-size: cover;
    transform-origin: center;
    scale: 1.05;
    z-index: -1;
  }

  .p1-indicator {
    position: absolute;
    top: calc(100% + var(--size-2));
    left: 25%;
    display: block;
    background-color: var(--blue-8);
    color: var(--red-1);
    padding: var(--size-1) var(--size-2);
    font-weight: bold;
  }

  .p2-indicator {
    position: absolute;
    top: 100%;
    left: 70%;
    display: block;
    background-color: var(--red-8);
    color: var(--red-1);
    padding: var(--size-1) var(--size-2);
    font-weight: bold;
  }
}
</style>
