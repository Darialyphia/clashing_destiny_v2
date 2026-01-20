<script setup lang="ts">
import { useCollectionPage } from './useCollectionPage';
import BlueprintCard from '@/card/components/BlueprintCard.vue';
import type { CardBlueprint } from '@game/engine/src/card/card-blueprint';
import type { CardId } from '@game/api';
import UiModal from '@/ui/components/UiModal.vue';
import { CARD_SET_DICTIONARY } from '@game/engine/src/card/sets';
import CardText from '@/card/components/CardText.vue';
import { formatAbilityText } from '@/utils/formatters';

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

    <UiModal
      v-model:is-opened="isModalOpened"
      :title="card.card.name"
      :description="card.card.description"
      :style="{ '--ui-modal-size': 'var(--size-lg)' }"
    >
      <div class="modal-layout">
        <BlueprintCard
          :blueprint="card.card"
          show-stats
          :is-foil="card.isFoil"
          class="modal-card"
        />
        <div class="modal-details surface">
          <div class="card-header">
            <h2 class="card-name">{{ card.card.name }}</h2>
            <div class="card-meta">
              <div class="meta-item">
                <span class="meta-label">Rarity</span>
                <span class="meta-value meta-rarity">
                  {{ card.card.rarity }}
                </span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Set</span>
                <span class="meta-value">
                  {{ CARD_SET_DICTIONARY[card.card.setId].name }}
                </span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Copies Owned</span>
                <span class="meta-value meta-copies">
                  {{ card.copiesOwned }}
                </span>
              </div>
            </div>
          </div>

          <div class="divider"></div>

          <div class="card-section">
            <h3 class="section-title">Description</h3>
            <div class="section-content">
              <CardText
                :text="card.card.description"
                style="--card-text-color: currentColor"
              />
            </div>
          </div>

          <template v-if="card.card.abilities?.length">
            <div class="divider"></div>

            <div class="card-section">
              <h3 class="section-title">Abilities</h3>
              <ul class="abilities-list">
                <li
                  v-for="(ability, index) in card.card.abilities"
                  :key="index"
                  class="ability-item"
                >
                  <CardText
                    :text="formatAbilityText(ability)"
                    style="--card-text-color: currentColor"
                  />
                </li>
              </ul>
            </div>
          </template>
        </div>
      </div>
    </UiModal>
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

/* Modal Layout */
.modal-layout {
  display: flex;
  gap: var(--size-2);
}

.modal-card {
  flex-shrink: 0;
}

.modal-details {
  flex: 1;
  padding: var(--size-7);
  min-width: 0;
  padding: var(--size-7);
}

.card-header {
  display: flex;
  flex-direction: column;
  gap: var(--size-4);
}

.card-name {
  font-size: var(--font-size-5);
  font-weight: var(--font-weight-7);
  color: var(--text-1);
  line-height: var(--font-lineheight-1);
  margin: 0;
  letter-spacing: var(--font-letterspacing-0);
}

.card-meta {
  display: flex;
  gap: var(--size-6);
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: var(--size-1);
}

.meta-label {
  font-size: var(--font-size-0);
  font-weight: var(--font-weight-6);
  color: var(--text-3);
  text-transform: uppercase;
  letter-spacing: var(--font-letterspacing-3);
}

.meta-value {
  font-size: var(--font-size-3);
  font-weight: var(--font-weight-6);
  color: var(--text-1);
}

.meta-rarity {
  color: var(--primary);
  text-transform: capitalize;
}

.meta-copies {
  color: var(--primary);
  font-weight: var(--font-weight-7);
}

.divider {
  height: var(--border-size-2);
  background: var(--border-subtle);
  margin: var(--size-5) 0;
  border-radius: var(--radius-pill);
}

.card-section {
  display: flex;
  flex-direction: column;
  gap: var(--size-3);
}

.section-title {
  font-size: var(--font-size-2);
  font-weight: var(--font-weight-7);
  color: var(--text-2);
  text-transform: uppercase;
  letter-spacing: var(--font-letterspacing-2);
  margin: 0;
}

.section-content {
  font-size: var(--font-size-2);
  line-height: var(--font-lineheight-3);
  color: var(--text-1);
  padding: var(--size-3) var(--size-4);
  background: var(--surface-3);
  border-radius: var(--radius-2);
  border-left: var(--border-size-3) solid var(--border-dimmed);
}

.abilities-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--size-3);
}

.ability-item {
  padding: var(--size-3) var(--size-4);
  background: var(--surface-3);
  border-radius: var(--radius-2);
  border-left: var(--border-size-3) solid var(--border-dimmed);
  font-size: var(--font-size-2);
  color: var(--text-1);
  transition: border-color var(--ease-2) var(--speed-2);
}

.ability-item:hover {
  border-left-color: var(--border);
}
</style>
