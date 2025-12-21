<script setup lang="ts">
import UiDrawer from '@/ui/components/UiDrawer.vue';
import UiSwitch from '@/ui/components/UiSwitch.vue';
import type { CardBlueprint } from '@game/engine/src/card/card-blueprint';

const isOpened = defineModel<boolean>('isOpened', { required: true });

const {
  cards,
  selectedCard,
  searchQuery,
  hidePlaceholderCards,
  hasPlaceholderArt
} = defineProps<{
  cards: CardBlueprint[];
  selectedCard: CardBlueprint | null;
  searchQuery: string;
  hidePlaceholderCards: boolean;
  hasPlaceholderArt: (card: CardBlueprint) => boolean;
}>();

const emit = defineEmits<{
  selectCard: [card: CardBlueprint];
  'update:searchQuery': [value: string];
  'update:hidePlaceholderCards': [value: boolean];
}>();

const handleSelectCard = (card: CardBlueprint) => {
  emit('selectCard', card);
  isOpened.value = false; // Close drawer on mobile
};

const localSearchQuery = computed({
  get: () => searchQuery,
  set: (value: string) => emit('update:searchQuery', value)
});

const localHidePlaceholder = computed({
  get: () => hidePlaceholderCards,
  set: (value: boolean) => emit('update:hidePlaceholderCards', value)
});
</script>

<template>
  <UiDrawer
    v-model:is-opened="isOpened"
    title="Select Card"
    position="left"
    :style="{ '--ui-drawer-size': '320px' }"
  >
    <div class="drawer-inner">
      <div class="drawer-header">
        <h2>Cards</h2>
        <input
          v-model="localSearchQuery"
          type="text"
          placeholder="Search cards..."
          class="search-input"
        />
        <label class="filter-toggle">
          <UiSwitch v-model="localHidePlaceholder" />
          <span>Hide placeholder art</span>
        </label>
      </div>
      <div class="card-list fancy-scrollbar">
        <button
          v-for="card in cards"
          :key="card.id"
          :class="['card-item', { active: selectedCard?.id === card.id }]"
          @click="handleSelectCard(card)"
        >
          <div class="card-item-content">
            <span class="card-name">{{ card.name }}</span>
            <span v-if="hasPlaceholderArt(card)" class="placeholder-badge">
              Placeholder Art
            </span>
          </div>
        </button>
      </div>
    </div>
  </UiDrawer>
</template>

<style scoped lang="postcss">
.drawer-inner {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--surface-2);
  color: var(--text-1);
}

.drawer-header {
  padding: var(--size-4);
  border-bottom: 1px solid var(--surface-3);
}

.drawer-header h2 {
  margin: 0 0 var(--size-3);
  font-size: var(--font-size-4);
}

.search-input {
  width: 100%;
  padding: var(--size-2);
  border: 1px solid var(--surface-3);
  border-radius: var(--radius-2);
  background: var(--surface-1);
  color: var(--text-1);
  font-size: var(--font-size-1);
}

.search-input:focus {
  outline: 2px solid var(--brand);
  outline-offset: 2px;
}

.filter-toggle {
  display: flex;
  align-items: center;
  gap: var(--size-2);
  margin-top: var(--size-3);
  cursor: pointer;
  user-select: none;
}

.filter-toggle span {
  font-size: var(--font-size-1);
  color: var(--text-2);
}

.card-list {
  flex: 1;
  overflow-y: auto;
  padding: var(--size-2);
}

.card-item {
  width: 100%;
  padding: var(--size-3);
  margin-bottom: var(--size-2);
  border: 1px solid var(--surface-3);
  border-radius: var(--radius-2);
  background: var(--surface-1);
  color: var(--text-1);
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.card-item:hover {
  background: var(--surface-3);
  border-color: var(--brand);
}

.card-item.active {
  background: var(--primary);
  color: var(--surface-1);
  border-color: var(--brand);
}

.card-item-content {
  display: flex;
  flex-direction: column;
  gap: var(--size-1);
}

.card-name {
  font-weight: var(--font-weight-6);
  font-size: var(--font-size-2);
}

.placeholder-badge {
  font-size: var(--font-size-0);
  padding: var(--size-1) var(--size-2);
  background: var(--yellow-6);
  color: var(--gray-9);
  border-radius: var(--radius-2);
  font-weight: var(--font-weight-5);
  width: fit-content;
}

.card-item.active .placeholder-badge {
  background: var(--yellow-4);
  color: var(--gray-9);
}
</style>
