<script setup lang="ts">
// import { domToPng } from 'modern-screenshot';
import { useCollectionPage } from './useCollectionPage';
import CollectionCard from './CollectionCard.vue';
import { useIntersectionObserver } from '@vueuse/core';

const { cards, viewMode } = useCollectionPage();

// const screenshot = async (id: string, e: MouseEvent) => {
//   const card = (e.target as HTMLElement)
//     .closest('li')
//     ?.querySelector('.card-front') as HTMLElement;
//   const png = await domToPng(card, {
//     backgroundColor: 'transparent'
//   });
//   const a = document.createElement('a');
//   a.href = png;
//   a.download = `${id}.png`;
//   a.click();
// };

const listRoot = useTemplateRef('card-list');
const visibleCards = ref(new Set<string>());

useIntersectionObserver(
  computed(() => {
    if (!listRoot.value) return [];
    return Array.from(
      listRoot.value.querySelectorAll('li[data-collection-card-id]')
    ) as HTMLLIElement[];
  }),
  entries => {
    entries.forEach(entry => {
      const cardId = entry.target.getAttribute('data-collection-card-id');
      if (!cardId) return;
      if (entry.isIntersecting) {
        visibleCards.value.add(cardId);
      } else {
        visibleCards.value.delete(cardId);
      }
    });
  },
  {
    root: listRoot,
    rootMargin: '300px 0px',
    threshold: 0
  }
);
</script>

<template>
  <ul
    ref="card-list"
    class="cards fancy-scrollbar"
    :class="viewMode"
    v-if="cards.length"
  >
    <li v-for="card in cards" :key="card.id" :data-collection-card-id="card.id">
      <!-- <Transition> -->
      <CollectionCard v-if="visibleCards.has(card.id)" :card="card" />
      <!-- </Transition> -->
      <!-- <button
        v-if="!isEditingDeck"
        @click="screenshot(card.id, $event)"
        class="absolute bottom-0"
      >
        Screenshot
      </button> -->
    </li>
  </ul>
  <p v-else class="text-center">No cards found.</p>
</template>

<style scoped lang="postcss">
.cards {
  --min-column-size: 14rem;
  column-gap: var(--size-6);
  row-gap: var(--size-3);
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(var(--min-column-size), 1fr));
  justify-items: center;
  overflow-x: hidden;
  overflow-y: auto;
  align-content: start;
  padding-inline: var(--size-4);
  padding-bottom: var(--size-10);

  @screen lt-lg {
    --pixel-scale: 1;
    --min-column-size: 10rem;
    .collection-card {
      transform: scale(0.5);
      transform-origin: top left;
    }
  }

  &.compact {
    --pixel-scale: 1;
    --min-column-size: 8rem;
    gap: var(--size-2);

    /* .collection-card {
      transform: scale(0.5);
      transform-origin: top left;
    } */
  }

  li {
    position: relative;
    transform-style: preserve-3d;
    perspective: 700px;
    perspective-origin: center;
    isolation: isolate;
    height: calc(var(--card-height) * var(--pixel-scale));
    width: calc(var(--card-width) * var(--pixel-scale));
  }
}

.card.disabled {
  filter: grayscale(100%);
}

.card:not(.disabled):hover {
  cursor: url('/assets/ui/cursor-hover.png'), auto;
}
</style>
