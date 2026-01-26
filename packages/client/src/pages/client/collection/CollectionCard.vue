<script setup lang="ts">
import { useCollectionPage } from './useCollectionPage';
import BlueprintCard from '@/card/components/BlueprintCard.vue';
import type { CardBlueprint } from '@game/engine/src/card/card-blueprint';
import type { CardId } from '@game/api';
import CardDetailsModal from './CardDetailsModal.vue';

const { deckBuilder, isEditingDeck } = useCollectionPage();

const { card } = defineProps<{
  card: {
    card: CardBlueprint;
    id: string;
    isFoil: boolean;
    copiesOwned: number;
  };
}>();

const canAddCard = computed(() => {
  if (!isEditingDeck.value) return false;
  if (card.copiesOwned === 0) return false;

  return (
    deckBuilder.value.canAdd({
      blueprintId: card.card.id,
      copies: card.copiesOwned,
      meta: {
        cardId: card.id as CardId,
        isFoil: card.isFoil
      }
    }) &&
    card.copiesOwned > (deckBuilder.value.getCard(card.card.id)?.copies ?? 0)
  );
});

const isModalOpened = ref(false);
const root = useTemplateRef('root');
</script>

<template>
  <div ref="root">
    <BlueprintCard
      :blueprint="card.card"
      show-stats
      :is-foil="card.isFoil"
      class="collection-card"
      :class="{
        disabled: card.copiesOwned === 0 || (isEditingDeck && !canAddCard)
      }"
      @click="
        () => {
          if (!isEditingDeck) return;
          if (!canAddCard) return;

          deckBuilder.addCard({
            blueprintId: card.card.id,
            meta: {
              cardId: card.id as CardId,
              isFoil: card.isFoil
            }
          });
        }
      "
      @contextmenu.prevent="isModalOpened = true"
    />

    <CardDetailsModal v-model:is-opened="isModalOpened" :card="card" />

    <div
      class="text-center text-xs text-yellow-50/90 select-none pointer-events-none py-2"
    >
      X{{ card.copiesOwned }}
    </div>
  </div>
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

.collection-card.disabled {
  filter: grayscale(50%) brightness(60%);
  opacity: 0.75;
}

.collection-card:not(.disabled):hover {
  cursor: url('@/assets/ui/cursor-hover.png'), auto;
}
</style>
