<script setup lang="ts">
import FancyButton from '@/ui/components/FancyButton.vue';
import { useCollectionPage } from './useCollectionPage';

const { deckBuilder, saveDeck, stopEditingDeck } = useCollectionPage();
</script>

<template>
  <footer>
    <div class="deck-count">
      <div>
        Main deck ({{ deckBuilder.mainDeckSize }} /
        {{ deckBuilder.validator.mainDeckSize }})
      </div>
      <div>
        Destiny Deck ({{ deckBuilder.destinyDeckSize }} /
        {{ deckBuilder.validator.destinyDeckSize }})
      </div>
    </div>
    <div class="flex gap-2 mt-3">
      <FancyButton text="Back" variant="error" @click="stopEditingDeck" />
      <FancyButton text="Save" variant="info" @click="saveDeck" />
    </div>
  </footer>
</template>

<style scoped lang="postcss">
.deck-count {
  margin-top: auto;
  font-size: var(--font-size-1);
  line-height: 1;
  font-weight: 500;
  text-align: right;
  padding: var(--size-3) var(--size-3) 0;
  box-shadow: 0 -10px 1rem hsl(var(--gray-12-hsl) / 0.5);
}

footer {
  position: sticky;
  bottom: 0;
  background-color: #10181e;
}
</style>
