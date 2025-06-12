<script setup lang="ts">
import { domToPng } from 'modern-screenshot';
import { useCollectionPage } from './useCollectionPage';
import BlueprintCard from '@/card/components/BlueprintCard.vue';
import { vIntersectionObserver } from '@vueuse/components';
const { cards, viewMode, deckBuilder, isEditingDeck } = useCollectionPage();

const screenshot = async (id: string, e: MouseEvent) => {
  const card = (e.target as HTMLElement)
    .closest('li')
    ?.querySelector('.card-front') as HTMLElement;
  const png = await domToPng(card, {
    backgroundColor: 'transparent'
  });
  const a = document.createElement('a');
  a.href = png;
  a.download = `${id}.png`;
  a.click();
};

const visibleCards = ref(new Set<string>());
const onIntersectionObserver =
  (cardId: string) => (entries: IntersectionObserverEntry[]) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        visibleCards.value.add(cardId);
      } else {
        visibleCards.value.delete(cardId);
      }
    });
  };

const listRoot = useTemplateRef('card-list');

watch(viewMode, () => {
  visibleCards.value.clear();
});
</script>

<template>
  <ul
    ref="card-list"
    class="cards fancy-scrollbar"
    :class="viewMode"
    v-if="cards.length"
  >
    <li
      v-for="card in cards"
      :key="card.id"
      v-intersection-observer="[
        onIntersectionObserver(card.id),
        {
          root: listRoot,
          rootMargin: viewMode === 'compact' ? '-50% 0px' : '0px'
        }
      ]"
    >
      <Transition>
        <BlueprintCard
          v-if="visibleCards.has(card.id)"
          :blueprint="card"
          class="collection-card"
          :class="{ disabled: isEditingDeck && !deckBuilder.canAdd(card.id) }"
          @click="
            () => {
              if (!isEditingDeck) return;
              if (deckBuilder.canAdd(card.id)) {
                deckBuilder.addCard(card.id);
              }
            }
          "
          @contextmenu.prevent="
            () => {
              if (!isEditingDeck) return;
              if (deckBuilder.hasCard(card.id)) {
                deckBuilder.removeCard(card.id);
              }
            }
          "
        />
      </Transition>
      <button
        v-if="!isEditingDeck"
        @click="screenshot(card.id, $event)"
        class="absolute bottom-0"
      >
        Screenshot
      </button>
    </li>
  </ul>
  <p v-else class="text-center">No cards found.</p>
</template>

<style scoped lang="postcss">
.cards {
  --pixel-scale: 2;
  --min-column-size: 20rem;
  gap: var(--size-6);
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(var(--min-column-size), 1fr));
  justify-items: center;
  overflow-y: auto;
  overflow-x: hidden;

  &.compact {
    --pixel-scale: 1;
    --min-column-size: 10rem;
    .collection-card {
      transform: scale(0.5);
      transform-origin: top left;
    }
  }

  li {
    position: relative;
    width: calc(var(--card-width) * var(--pixel-scale));
    height: calc(var(--card-height) * var(--pixel-scale));
  }
}

.collection-card {
  --transition-duration: 0.7s;
  &:is(.v-enter-active, .v-leave-active) {
    transition: all var(--transition-duration) var(--ease-spring-3);
  }

  &:is(.v-enter-from, .v-leave-to) {
    transform: translateY(15px);
    opacity: 0.5;
  }
}

.compact .collection-card {
  --transition-duration: 0s;
}

.card.disabled {
  filter: grayscale(100%);
}

.card:not(.disabled):hover {
  cursor: url('/assets/ui/cursor-hover.png'), auto;
}
</style>
