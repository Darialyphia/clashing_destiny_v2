<script setup lang="ts">
import { provideCollectionPage } from './useCollectionPage';
import DeckList from './DeckList.vue';
import DeckEditor from './DeckEditor.vue';
import Collection from './Collection.vue';
import CollectionFilters from './CollectionFilters.vue';
import CardDetailsModal from './CardDetailsModal/index.vue';
import { useResponsive } from '@/shared/composables/useResponsive';

definePage({
  name: 'Collection',
  path: '/client/collection',
  meta: {
    wrapperClass: 'page-blur'
  }
});

const { isEditingDeck, cardScale } = provideCollectionPage();

const isSidebarContentDisplayed = ref(false);
setTimeout(() => {
  isSidebarContentDisplayed.value = true;
}, 1000);

const { isSmallViewport } = useResponsive();
</script>

<template>
  <div class="page" :style="{ '--card-scale': cardScale[0] }">
    <CollectionFilters v-if="!isSmallViewport" class="collection-header" />

    <Collection />

    <CardDetailsModal />

    <aside class="right-sidebar surface">
      <template v-if="isSidebarContentDisplayed">
        <DeckList v-if="!isEditingDeck" />
        <DeckEditor v-else />
      </template>
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
  @screen lt-lg {
    grid-template-columns: 1fr 12rem;
    column-gap: 0;
    grid-template-rows: 1fr;
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
  transition: translate 0.75s var(--ease-bounce-2);
  transition-delay: 0.25s;
  @starting-style {
    translate: 0 -100%;
  }
}

.right-sidebar {
  overflow-y: hidden;
  grid-row: 1 / -1;
  grid-column: 2;
  transition: translate 0.75s var(--ease-bounce-2);
  transition-delay: 0.4s;
  overflow-x: hidden;
  @starting-style {
    translate: 100% 0;
  }
  @screen lt-lg {
    grid-column: 2;
    padding-inline: var(--size-3);
  }
}
</style>
