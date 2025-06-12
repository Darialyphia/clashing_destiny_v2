<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { provideCollectionPage } from './useCollectionPage';

import CollectionFilters from './CollectionFilters.vue';
import DeckList from './DeckList.vue';
import DeckEditor from './DeckEditor.vue';
import Collection from './Collection.vue';

definePage({
  name: 'Collection'
});

const { isEditingDeck } = provideCollectionPage();
</script>

<template>
  <div class="page">
    <header>
      <nav>
        <ul class="flex gap-4">
          <li>
            <RouterLink :to="{ name: 'Home' }">Home</RouterLink>
          </li>
          <li>
            <RouterLink :to="{ name: 'Sandbox' }">Sandbox</RouterLink>
          </li>
        </ul>
      </nav>
    </header>
    <CollectionFilters class="filters" />

    <Collection class="cards" />

    <aside class="right-sidebar">
      <DeckList v-if="!isEditingDeck" />
      <DeckEditor v-else />
    </aside>
  </div>
</template>

<style scoped lang="postcss">
.page {
  overflow: hidden;
  height: 100dvh;
  pointer-events: auto;
  display: grid;
  grid-template-columns: auto 1fr 24rem;
  grid-template-rows: auto 1fr;
  column-gap: var(--size-5);

  > header {
    grid-row: 1;
    grid-column: 1 / span 2;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-block: var(--size-3);
    padding-inline: var(--size-5);
  }
}

.right-sidebar {
  padding: var(--size-6);
  overflow-y: hidden;
  grid-row: 1 / -1;
  grid-column: 3;
  border-image-slice: 63 fill;
  border-image-width: 64px;
  border-image-source: url('/assets/ui/ui-surface.png');
}

.filters {
  grid-row: 2;
  grid-column: 1;
}
</style>
