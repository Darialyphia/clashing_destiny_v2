<script setup lang="ts">
import { useResponsive } from '@/shared/composables/useResponsive';
import { useCollectionPage } from './useCollectionPage';
import BlueprintCard from '@/card/components/BlueprintCard.vue';
import type { CardBlueprint } from '@game/engine/src/card/card-blueprint';
import type { CardId } from '@game/api';
import { useDoubleTap } from '@/shared/composables/useDoubleTap';

const { card } = defineProps<{
  card: {
    card: CardBlueprint;
    id: string;
    isFoil: boolean;
    copiesOwned: number;
  };
}>();

const { deckBuilder, isEditingDeck, selectCard, selectedCard } =
  useCollectionPage();

const canAddCard = computed(() => {
  if (!isEditingDeck.value) return false;
  if (card.copiesOwned === 0) return false;

  const existing = deckBuilder.value.getCardById(card.id);
  if (existing && card.copiesOwned <= existing.copies) {
    return false;
  }

  return deckBuilder.value.canAdd(
    existing ?? {
      blueprintId: card.card.id,
      copies: 0,
      meta: {
        cardId: card.id as CardId,
        isFoil: card.isFoil
      }
    }
  );
});

const isInvisible = ref(false);
watch(selectedCard, () => {
  // we add a delay to avoid flickering when right clicking a card to see the modal
  // because the modal has some Flip shenanigans going on
  if (selectedCard.value?.id === card.id) {
    setTimeout(() => {
      isInvisible.value = true;
    }, 0);
  } else {
    isInvisible.value = false;
  }
});

const { isTouchDevice } = useResponsive();
const onRightClick = () => {
  if (isTouchDevice.value) return;
  selectCard(card.id);
};

const root = useTemplateRef('root');
useDoubleTap(root, () => {
  selectCard(card.id);
});
</script>

<template>
  <div ref="root" class="relative">
    <BlueprintCard
      :blueprint="card.card"
      show-stats
      :is-foil="card.isFoil"
      class="collection-card"
      :class="{
        disabled: card.copiesOwned === 0 || (isEditingDeck && !canAddCard),
        invisible: isInvisible
      }"
      :data-flip-id="`collection-card-${card.id}`"
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
      @contextmenu.prevent="onRightClick"
    />

    <div class="copies-owned">X{{ card.copiesOwned }}</div>
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

  &.invisible {
    opacity: 0;
    pointer-events: none;
  }
}

.collection-card.disabled {
  filter: grayscale(50%) brightness(60%);
  opacity: 0.75;
}

.collection-card:not(.disabled):hover {
  cursor: url('@/assets/ui/cursor-hover.png'), auto;
}
.copies-owned {
  position: absolute;
  bottom: calc(var(--pixel-scale) * -3px);
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  font-size: var(--font-size-0);
  user-select: none;
  -webkit-text-stroke: 3px black;
  paint-order: stroke fill;
  display: grid;
  place-items: center;
  margin-top: var(--size-1);
  background: #222;
  padding: 0 var(--size-1);
}
</style>
