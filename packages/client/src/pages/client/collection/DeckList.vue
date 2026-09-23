<script setup lang="ts">
import PlayerDeck from '@/player/components/PlayerDeck.vue';
import { useCollectionPage } from './useCollectionPage';
import FancyButton from '@/ui/components/FancyButton.vue';
import { useResponsive } from '@/shared/composables/useResponsive';
import { useRouter } from 'vue-router';
const { decks, createDeck, editDeck } = useCollectionPage();

const { isSmallViewport } = useResponsive();

const router = useRouter();
</script>

<template>
  <div class="flex flex-col h-full">
    <p v-if="!decks" class="text-center text-4 mt-6">Loading...</p>
    <p v-else-if="!decks.length" class="text-center text-4 mt-6">
      You haven't created any deck.
    </p>
    <template v-else>
      <ul>
        <li v-for="(deck, index) in decks" :key="index">
          <PlayerDeck :deck="deck" @click="editDeck(deck.id)" />
        </li>
      </ul>
    </template>
    <FancyButton
      class="w-full"
      :class="!decks?.length && 'mx-auto'"
      text="New Deck"
      :size="isSmallViewport ? 'sm' : 'md'"
      @click="createDeck"
    />
    <FancyButton
      v-if="router.currentRoute.value.name !== 'ClientHome'"
      text="Back"
      :size="isSmallViewport ? 'sm' : 'md'"
      class="back-button"
      @click="router.push({ name: 'ClientHome' })"
    />
  </div>
</template>

<style scoped lang="postcss">
li {
  transition: all calc(var(--child-index) * 0.1s) var(--ease-2);
  @starting-style {
    transform: translateY(calc(var(--child-index) * -100%));
    opacity: 0;
  }

  &:hover {
    filter: brightness(1.25) drop-shadow(0 0 0.125rem yellow);
  }
}

.back-button {
  margin-top: auto;
  align-self: end;
}
</style>
