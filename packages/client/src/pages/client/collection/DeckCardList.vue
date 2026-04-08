<script setup lang="ts">
import { TabsRoot, TabsList, TabsTrigger, TabsContent } from 'reka-ui';
import { useCollectionPage } from './useCollectionPage';
import DeckCardListItems from './DeckCardListItems.vue';

const { deckBuilder } = useCollectionPage();
</script>

<template>
  <TabsRoot as-child default-value="main">
    <div class="deck-cards">
      <TabsList as-child>
        <header>
          <TabsTrigger value="main">
            Main ({{ deckBuilder.mainDeckSize }} /
            {{ deckBuilder.validator.mainDeckSize }})
          </TabsTrigger>
          <TabsTrigger value="destiny">
            Destiny ({{ deckBuilder.destinyDeckSize }} /
            {{ deckBuilder.validator.destinyDeckSize }})
          </TabsTrigger>
        </header>
      </TabsList>
      <TabsContent as-child value="main">
        <DeckCardListItems
          :cards="deckBuilder.mainDeckCards"
          :deck-builder="deckBuilder"
        />
      </TabsContent>
      <TabsContent as-child value="destiny">
        <DeckCardListItems
          :cards="deckBuilder.destinyDeckCards"
          :deck-builder="deckBuilder"
        />
      </TabsContent>
    </div>
  </TabsRoot>
</template>

<style scoped lang="postcss">
.deck-cards {
  overflow-y: hidden;
  display: flex;
  flex-direction: column;
  display: grid;
  grid-template-rows: auto 1fr;
}

header {
  display: flex;
  gap: 0;
  background: var(--surface-1);
  border-bottom: solid var(--border-size-2) #d7ad42;
  padding: 0 var(--size-2);
}

button[role='tab'] {
  cursor: url('@/assets/ui/cursor-hover.png'), auto;
  flex: 1;
  padding: var(--size-2) var(--size-3);
  font-weight: var(--font-weight-6);
  font-size: var(--font-size-0);
  color: var(--color-gray-6);
  background: transparent;
  border: none;
  border-bottom: solid var(--border-size-3) transparent;
  transition: all 0.2s var(--ease-1);
  position: relative;
  white-space: nowrap;

  &:hover {
    color: var(--color-gray-8);
    background: hsl(from #d7ad42 h s l / 0.05);
  }

  &[data-state='active'] {
    color: #d7ad42;
    background: hsl(from #d7ad42 h s l / 0.1);
    border-bottom-color: #d7ad42;
  }
}
</style>
