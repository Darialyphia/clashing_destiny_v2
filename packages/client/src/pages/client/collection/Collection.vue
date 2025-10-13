<script setup lang="ts">
// import { domToPng } from 'modern-screenshot';
import { useCollectionPage } from './useCollectionPage';
import CollectionCard from './CollectionCard.vue';
import { useIntersectionObserver } from '@vueuse/core';

const { cards, viewMode, isLoading } = useCollectionPage();

const listRoot = useTemplateRef('card-list');
const visibleCards = ref(new Set<string>());
const cardElements = computed(() => {
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  cards.value; //read the ref to trigger reactivity;
  if (!listRoot.value) return [];
  return Array.from(
    listRoot.value.querySelectorAll('li[data-collection-card-id]')
  ) as HTMLLIElement[];
});
useIntersectionObserver(
  cardElements,
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
  <Transition mode="out-in">
    <p v-if="isLoading" class="text-center">Loading Collection...</p>
    <ul
      ref="card-list"
      class="cards fancy-scrollbar"
      :class="viewMode"
      v-else-if="cards.length"
    >
      <li
        v-for="card in cards"
        :key="card.id"
        :data-collection-card-id="card.id"
      >
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
  </Transition>
</template>

<style scoped lang="postcss">
.cards {
  column-gap: var(--size-4);
  display: grid;
  grid-template-columns: repeat(
    auto-fill,
    minmax(calc(var(--card-width) * var(--pixel-scale)), 1fr)
  );
  justify-items: center;
  overflow-x: hidden;
  overflow-y: auto;
  align-content: start;
  padding-inline: var(--size-4);
  padding-bottom: var(--size-10);
  padding-top: var(--size-3);

  li {
    position: relative;
    transform-style: preserve-3d;
    perspective: 700px;
    perspective-origin: center;
    isolation: isolate;
    width: calc(var(--card-width) * var(--pixel-scale));
    aspect-ratio: var(--card-ratio);
  }

  @screen lt-lg {
    --pixel-scale: 1;
    li {
      width: calc(var(--card-small-width) * var(--pixel-scale));
      aspect-ratio: var(--card-small-ratio);
    }
  }

  &.compact {
    --pixel-scale: 1;
    li {
      width: calc(var(--card-small-width) * var(--pixel-scale));
      aspect-ratio: var(--card-small-ratio);
    }
  }
}

.card.disabled {
  filter: grayscale(100%);
}

.card:not(.disabled):hover {
  cursor: url('/assets/ui/cursor-hover.png'), auto;
}

.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s var(--ease-3);
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
