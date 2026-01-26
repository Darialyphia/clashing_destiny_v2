<script setup lang="ts">
// import { domToPng } from 'modern-screenshot';
import { useCollectionPage } from './useCollectionPage';
import CollectionCard from './CollectionCard.vue';
import { useIntersectionObserver } from '@vueuse/core';
import UiSpinner from '@/ui/components/UiSpinner.vue';

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
    rootMargin: '500px 0px',
    threshold: 0
  }
);
</script>

<template>
  <Transition
    mode="out-in"
    :appear="false"
    class="h-full overflow-hidden fancy-scrollbar"
  >
    <div v-if="isLoading" class="h-full flex items-center justify-center">
      <UiSpinner size="11" />
    </div>
    <div v-else-if="cards.length" class="h-full">
      <ul
        ref="card-list"
        class="cards fancy-scrollbar h-full overflow-auto"
        id="collection-cards"
        :class="viewMode"
      >
        <li
          v-for="card in cards"
          :key="card.id"
          :data-collection-card-id="card.id"
        >
          <Transition>
            <div v-if="visibleCards.has(card.id)">
              <CollectionCard :card="card" />
            </div>
          </Transition>
          <!-- <button
            v-if="!isEditingDeck"
            @click="screenshot(card.id, $event)"
            class="absolute bottom-0"
          >
            Screenshot
          </button> -->
        </li>
      </ul>
      <div id="collection-card-details-portal" />
    </div>
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

.card:not(.disabled):hover {
  cursor: url('@/assets/ui/cursor-hover.png'), auto;
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
