<script setup lang="ts">
import Sandbox from '@/game/components/Sandbox.vue';
import FancyButton from '@/ui/components/FancyButton.vue';
import { type UserDeck } from '@/card/composables/useDecks';
import DeckSelector from './DeckSelector.vue';
import type { PlayerOptions } from '@game/engine/src/player/player.entity';

definePage({
  name: 'Sandbox',
  path: '/client/sandbox',
  meta: {
    wrapperClass: 'page-blur'
  }
});

const p1Deck = ref<UserDeck | null>(null);
const p2Deck = ref<UserDeck | null>(null);
const isStarted = ref(false);

const mapCard = (c: { copies: number; blueprintId: string; isFoil: boolean }) =>
  Array.from({ length: c.copies }, () => ({
    blueprintId: c.blueprintId,
    isFoil: c.isFoil
  }));

const playersConfig = computed(() => {
  if (!p1Deck.value || !p2Deck.value) return null;
  return [
    {
      id: 'p1',
      name: 'Player 1',
      deck: {
        cards: p1Deck.value.cards.map(mapCard).flat()
      }
    },
    {
      id: 'p2',
      name: 'Player 2',
      deck: {
        cards: p2Deck.value.cards.map(mapCard).flat()
      }
    }
  ] as [PlayerOptions, PlayerOptions];
});
</script>

<template>
  <div v-if="!isStarted" class="page">
    <FancyButton
      class="absolute top-10 left-8"
      text="Back"
      size="md"
      :to="{ name: 'SelectMode' }"
    />

    <h1 class="dual-text" data-text="Select your Decks">Select your Decks</h1>

    <DeckSelector
      v-model:p1Deck="p1Deck"
      v-model:p2Deck="p2Deck"
      @start="isStarted = true"
    />
  </div>
  <Sandbox v-else-if="playersConfig" :players="playersConfig" />
</template>

<style lang="postcss" scoped>
.page {
  height: 100dvh;
  display: flex;
  flex-direction: column;
  padding-top: var(--size-12);
  background-image: url('@/assets/backgrounds/main-menu-overlay.png');
}

h1 {
  font-size: var(--font-size-7);
  font-weight: var(--font-weight-7);
  color: var(--text-1);
  margin-bottom: var(--size-3);
  font-family: 'Cinzel Decorative', serif;
  text-align: center;
}
</style>
