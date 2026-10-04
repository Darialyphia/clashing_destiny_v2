<script setup lang="ts">
import Sandbox from '@/game/components/Sandbox.vue';
import FancyButton from '@/ui/components/FancyButton.vue';
import PageTitle from '@/shared/components/PageTitle.vue';
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
      class="absolute top-10 left-8 lt-lg:top-3 lt-lg:left-0"
      text="Back"
      size="md"
      :to="{ name: 'SelectMode' }"
    />

    <PageTitle title="Select Decks" />

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
  background-size: 100% 100%;
  @screen lt-lg {
    padding-top: var(--size-3);
    padding-inline: var(--size-9);
    overflow-y: auto;
  }
}
</style>
