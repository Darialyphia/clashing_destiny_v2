<script setup lang="ts">
import { useCollectionPage } from './useCollectionPage';
import BlueprintCard from '@/card/components/BlueprintCard.vue';
import type { CardBlueprint } from '@game/engine/src/card/card-blueprint';

const { deckBuilder, isEditingDeck } = useCollectionPage();

const { card } = defineProps<{
  card: CardBlueprint;
}>();
</script>

<template>
  <BlueprintCard
    :blueprint="card"
    class="collection-card"
    :class="{
      disabled: isEditingDeck && !deckBuilder.canAdd(card.id)
    }"
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

  &:is(.v-enter-active, .v-leave-active) {
    transition: all var(--transition-duration) var(--ease-spring-3);
  }

  &:is(.v-enter-from, .v-leave-to) {
    transform: translateY(15px);
    opacity: 0.5;
  }
}

.card.disabled {
  filter: grayscale(100%);
}

.collection-card:not(.disabled):hover {
  cursor: url('/assets/ui/cursor-hover.png'), auto;
}
</style>
