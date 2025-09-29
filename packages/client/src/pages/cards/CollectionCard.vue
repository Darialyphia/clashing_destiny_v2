<script setup lang="ts">
import { useCollectionPage } from './useCollectionPage';
import BlueprintCard from '@/card/components/BlueprintCard.vue';
import type { CardBlueprint } from '@game/engine/src/card/card-blueprint';
import { waitFor } from '@game/shared';
import { domToPng } from 'modern-screenshot';

const { deckBuilder, isEditingDeck } = useCollectionPage();

const { card } = defineProps<{
  card: CardBlueprint;
}>();

const screenshot = async (e: MouseEvent) => {
  const element = (e.currentTarget as HTMLElement)?.querySelector(
    '.card-front'
  ) as HTMLElement;
  const glare = element.querySelector('.glare') as HTMLElement;
  console.log(glare);
  if (glare) {
    glare.style.visibility = 'hidden';
  }
  await waitFor(50);
  const png = await domToPng(element, {
    backgroundColor: 'transparent'
  });
  if (glare) {
    glare.style.visibility = '';
  }
  const a = document.createElement('a');
  a.href = png;
  a.download = `${card.name
    .replace(/\W+/g, ' ')
    .split(/ |\B(?=[A-Z])/)
    .map(word => word.toLowerCase())
    .join('_')}.png`;
  a.click();
};
</script>

<template>
  <BlueprintCard
    :blueprint="card"
    class="collection-card"
    :class="{
      disabled: isEditingDeck && !deckBuilder.canAdd(card.id)
    }"
    @dblclick="screenshot($event)"
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
</template>

<style scoped lang="postcss">
.collection-card {
  --transition-duration: 0.7s;

  /* &:is(.v-enter-active, .v-leave-active) {
    transition: all var(--transition-duration) var(--ease-spring-3);
  }

  &:is(.v-enter-from, .v-leave-to) {
    transform: translateY(15px);
    opacity: 0.5;
  } */
}

.card.disabled {
  filter: grayscale(100%);
}

.collection-card:not(.disabled):hover {
  cursor: url('/assets/ui/cursor-hover.png'), auto;
}
</style>
