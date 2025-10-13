<script setup lang="ts">
import {
  HoverCardRoot,
  HoverCardTrigger,
  HoverCardPortal,
  HoverCardContent
} from 'reka-ui';
import BlueprintSmallCard from '@/card/components/BlueprintSmallCard.vue';
import { useCollectionPage } from './useCollectionPage';
import BlueprintCard from '@/card/components/BlueprintCard.vue';
import type { CardBlueprint } from '@game/engine/src/card/card-blueprint';
import type { CardId } from '@game/api';

const { deckBuilder, isEditingDeck, viewMode } = useCollectionPage();

const { card } = defineProps<{
  card: {
    card: CardBlueprint;
    id: string;
    isFoil: boolean;
    copiesOwned: number;
  };
}>();

const cardComponents: Record<typeof viewMode.value, any> = {
  compact: BlueprintSmallCard,
  expanded: BlueprintCard
};
const component = computed(() => cardComponents[viewMode.value]);

const isPreviewOpened = ref(false);

const canAddCard = computed(() => {
  if (!isEditingDeck.value) return false;

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
</script>

<template>
  <HoverCardRoot
    :open-delay="250"
    :close-delay="0"
    :open="viewMode === 'expanded' ? false : isPreviewOpened"
    @update:open="isPreviewOpened = $event"
  >
    <HoverCardTrigger class="inspectable-card" v-bind="$attrs">
      <div>
        <component
          :is="component"
          :blueprint="card.card"
          show-stats
          class="collection-card"
          :class="{
            disabled: isEditingDeck && !canAddCard
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
          @contextmenu.prevent="
            () => {
              if (!isEditingDeck) return;
              if (deckBuilder.hasCard(card.id)) {
                deckBuilder.removeCard(card.id);
              }
            }
          "
        />

        <div
          class="text-center text-xs text-yellow-50/90 select-none pointer-events-none py-2"
        >
          X{{ card.copiesOwned }}
        </div>
      </div>
    </HoverCardTrigger>
    <HoverCardPortal>
      <HoverCardContent v-if="viewMode === 'compact'">
        <BlueprintCard :blueprint="card.card" />
      </HoverCardContent>
    </HoverCardPortal>
  </HoverCardRoot>
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
  filter: grayscale(50%) brightness(80%);
}

.collection-card:not(.disabled):hover {
  cursor: url('/assets/ui/cursor-hover.png'), auto;
}
</style>
