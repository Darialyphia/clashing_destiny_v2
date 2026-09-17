<script setup lang="ts">
import { provideCollectionPage } from './useCollectionPage';
import DeckList from './DeckList.vue';
import DeckEditor from './DeckEditor.vue';
import Collection from './Collection.vue';
import CollectionFilters from './CollectionFilters.vue';

definePage({
  name: 'Collection',
  path: '/client/collection',
  meta: {
    requiresAuth: true,
    transition: 'blur'
  }
});

const { isEditingDeck, cardScale } = provideCollectionPage();
</script>

<template>
  <div class="page" :style="{ '--card-scale': cardScale[0] }">
    <CollectionFilters class="collection-header" />

    <Collection class="collection" />

    <aside class="right-sidebar surface">
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
  grid-template-columns: 1fr 24rem;
  grid-template-rows: auto 1fr;
  transform-style: preserve-3d;
  backdrop-filter: blur(25px) brightness(0.75);
  transition:
    backdrop-filter 0.75s var(--ease-3),
    opacity 0.75s var(--ease-3);
  @starting-style {
    backdrop-filter: blur(0px);
  }
  &.v-leave-to {
    backdrop-filter: blur(0px) brightness(1);
    opacity: 0;
  }
  @screen lt-lg {
    grid-template-columns: 1fr 18rem;
    column-gap: 0;
  }
}

.collection-header {
  grid-row: 1;
  grid-column: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-block: var(--size-3);
  padding-inline: var(--size-5);
  transition: translate 0.75s var(--ease-3);
  @starting-style {
    translate: 0 -100%;
  }
}

.right-sidebar {
  overflow-y: hidden;
  grid-row: 1 / -1;
  grid-column: 2;
  transition: translate 0.75s var(--ease-3);
  @starting-style {
    translate: 100% 0;
  }
  @screen lt-lg {
    grid-column: 2;
  }
}
</style>
