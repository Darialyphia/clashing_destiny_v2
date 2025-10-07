<script setup lang="ts">
import { provideCollectionPage } from './useCollectionPage';

import CollectionFilters from './CollectionFilters.vue';
import DeckList from './DeckList.vue';
import DeckEditor from './DeckEditor.vue';
import Collection from './Collection.vue';
import AuthenticatedHeader from '@/AuthenticatedHeader.vue';

definePage({
  name: 'Collection',
  path: '/client/collection',
  meta: {
    requiresAuth: true
  }
});

const { isEditingDeck } = provideCollectionPage();
</script>

<template>
  <div class="page">
    <AuthenticatedHeader class="collection-header" />
    <CollectionFilters class="filters lt-lg:hidden" />

    <Collection />

    <aside class="right-sidebar surface">
      <DeckList v-if="!isEditingDeck" />
      <DeckEditor v-else />
    </aside>
  </div>
</template>

<style scoped lang="postcss">
.page {
  /* overflow: hidden; */
  height: 100dvh;
  pointer-events: auto;
  display: grid;
  grid-template-columns: auto 1fr 24rem;
  grid-template-rows: auto 1fr;

  transform-style: preserve-3d;
  @screen lt-lg {
    grid-template-columns: 1fr 18rem;
    column-gap: 0;
  }
}

.collection-header {
  grid-row: 1;
  grid-column: 1 / span 2;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-block: var(--size-3);
  padding-inline: var(--size-5);
}

.right-sidebar {
  overflow-y: hidden;
  grid-row: 1 / -1;
  grid-column: 3;

  @screen lt-lg {
    grid-column: 2;
  }
}

.filters {
  grid-row: 2;
  grid-column: 1;
}
</style>
