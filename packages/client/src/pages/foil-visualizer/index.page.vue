<script setup lang="ts">
import BlueprintCard from '@/card/components/BlueprintCard.vue';
import UiSwitch from '@/ui/components/UiSwitch.vue';
import UnauthenticatedHeader from '@/UnauthenticatedHeader.vue';
import CardListDrawer from './CardListDrawer.vue';
import FoilControlsDrawer from './FoilControlsDrawer.vue';
import type { CardBlueprint } from '@game/engine/src/card/card-blueprint';
import { CARDS_DICTIONARY } from '@game/engine/src/card/sets';

definePage({
  name: 'FoilVisualizer'
});

const cards = Object.values(CARDS_DICTIONARY);
const selectedCard = ref<CardBlueprint | null>(cards[0]);
const foilOptions = ref<Partial<CardBlueprint['art'][string]['foil']>>({
  sheen: true,
  oil: false,
  gradient: false,
  lightGradient: false,
  scanlines: false,
  goldenGlare: false,
  glitter: false
});

const searchQuery = ref('');
const hidePlaceholderCards = ref(true);
const isCardListDrawerOpen = ref(false);
const isFoilControlsDrawerOpen = ref(false);

const hasPlaceholderArt = (card: CardBlueprint) => {
  const art = card.art.default;
  return Boolean(
    art.bg.includes('placeholder') ||
      art.main.includes('placeholder') ||
      art.breakout?.includes('placeholder')
  );
};

const filteredCards = computed(() => {
  let filtered = cards;

  // Filter by placeholder art
  if (hidePlaceholderCards.value) {
    filtered = filtered.filter(card => !hasPlaceholderArt(card));
  }

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      card =>
        card.name.toLowerCase().includes(query) ||
        card.id.toLowerCase().includes(query)
    );
  }

  return filtered;
});

const selectCard = (card: CardBlueprint) => {
  selectedCard.value = card;
  // Initialize foil options from the card's default foil settings
  foilOptions.value = { ...card.art.default.foil };
};

const updateFoilOption = (key: string, value: boolean | undefined) => {
  foilOptions.value = {
    ...foilOptions.value,
    [key]: value
  };
};
</script>

<template>
  <div class="page">
    <UnauthenticatedHeader />
    <div class="foil-visualizer">
      <!-- Mobile Action Buttons -->
      <div class="mobile-actions">
        <button class="mobile-btn" @click="isCardListDrawerOpen = true">
          <span>Cards</span>
        </button>
        <button class="mobile-btn" @click="isFoilControlsDrawerOpen = true">
          <span>Foil Effects</span>
        </button>
      </div>

      <!-- Mobile Drawers -->
      <CardListDrawer
        v-model:is-opened="isCardListDrawerOpen"
        :cards="filteredCards"
        :selected-card="selectedCard"
        :search-query="searchQuery"
        :hide-placeholder-cards="hidePlaceholderCards"
        :has-placeholder-art="hasPlaceholderArt"
        @select-card="selectCard"
        @update:search-query="searchQuery = $event"
        @update:hide-placeholder-cards="hidePlaceholderCards = $event"
      />
      <FoilControlsDrawer
        v-model:is-opened="isFoilControlsDrawerOpen"
        :foil-options="foilOptions"
        @update:foil-option="updateFoilOption"
      />

      <!-- Desktop Left Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <h2>Cards</h2>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search cards..."
            class="search-input"
          />
          <label class="filter-toggle">
            <UiSwitch v-model="hidePlaceholderCards" />
            <span>Hide placeholder art</span>
          </label>
        </div>
        <div class="card-list fancy-scrollbar">
          <button
            v-for="card in filteredCards"
            :key="card.id"
            :class="['card-item', { active: selectedCard?.id === card.id }]"
            @click="selectCard(card)"
          >
            <div class="card-item-content">
              <span class="card-name">{{ card.name }}</span>
              <span v-if="hasPlaceholderArt(card)" class="placeholder-badge">
                Placeholder Art
              </span>
            </div>
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="main-content">
        <div class="preview-section">
          <h2 class="desktop-only">Preview</h2>
          <div class="card-preview">
            <BlueprintCard
              v-if="selectedCard"
              :blueprint="selectedCard"
              is-foil
              :foil-overrides="foilOptions"
            />
          </div>
        </div>

        <!-- Desktop Controls Section -->
        <div class="controls-section">
          <h2>Foil Effects</h2>
          <div class="foil-controls">
            <label class="control-item">
              <UiSwitch v-model="foilOptions.sheen" />
              <span>Sheen</span>
            </label>
            <label class="control-item">
              <UiSwitch v-model="foilOptions.oil" />
              <span>Oil</span>
            </label>
            <label class="control-item">
              <UiSwitch v-model="foilOptions.gradient" />
              <span>Gradient</span>
            </label>
            <label class="control-item">
              <UiSwitch v-model="foilOptions.lightGradient" />
              <span>Light Gradient</span>
            </label>
            <label class="control-item">
              <UiSwitch v-model="foilOptions.scanlines" />
              <span>Scanlines</span>
            </label>
            <label class="control-item">
              <UiSwitch v-model="foilOptions.goldenGlare" />
              <span>Golden Glare</span>
            </label>
            <label class="control-item">
              <UiSwitch v-model="foilOptions.glitter" />
              <span>Glitter</span>
            </label>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped lang="postcss">
.page {
  display: grid;
  grid-template-rows: auto 1fr;
  height: 100dvh;
}

.foil-visualizer {
  display: flex;
  background: var(--surface-1);
  color: var(--text-1);
}

.sidebar {
  width: var(--size-content-2);
  border-right: 1px solid var(--surface-3);
  display: flex;
  flex-direction: column;
  background: var(--surface-2);
}

.sidebar-header {
  padding: var(--size-4);
  border-bottom: 1px solid var(--surface-3);
}

.sidebar-header h2 {
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
  gap: var(--size-1);
}

.card-name {
  font-weight: var(--font-weight-6);
  font-size: var(--font-size-2);
}

.placeholder-badge {
  font-size: var(--font-size-00);
  padding: var(--size-1) var(--size-2);
  border: solid var(--border-size-1) var(--red-9);
  color: var(--red-9);
  border-radius: var(--radius-2);
  font-weight: var(--font-weight-5);
  width: fit-content;
  margin-inline-start: auto;
}

.card-item.active .placeholder-badge {
  background: var(--yellow-4);
  color: var(--gray-9);
}

.main-content {
  flex: 1;
  display: flex;
  padding: var(--size-6);
  gap: var(--size-6);
  overflow-y: auto;
}

.preview-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.preview-section h2 {
  margin: 0 0 var(--size-4);
  font-size: var(--font-size-4);
}

.card-preview {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--size-8);
  min-height: 600px;
}

.controls-section {
  width: 300px;
  padding: var(--size-4);
  background: var(--surface-2);
  border-radius: var(--radius-3);
}

.controls-section h2 {
  margin: 0 0 var(--size-4);
  font-size: var(--font-size-3);
}

.foil-controls {
  display: flex;
  flex-direction: column;
  gap: var(--size-3);
}

.control-item {
  display: flex;
  align-items: center;
  gap: var(--size-2);
  cursor: pointer;
  padding: var(--size-2);
  border-radius: var(--radius-2);
  transition: background 0.2s ease;
}

.control-item:hover {
  background: var(--surface-3);
}

.control-item span {
  font-size: var(--font-size-2);
  user-select: none;
}

/* Mobile Styles */
.mobile-actions {
  display: none;
}

.desktop-only {
  display: block;
}

@media (max-width: 768px) {
  .foil-visualizer {
    flex-direction: column;
    position: relative;
  }

  .mobile-actions {
    display: flex;
    gap: var(--size-3);
    padding: var(--size-3);
    background: var(--surface-2);
    border-bottom: 1px solid var(--surface-3);
    position: sticky;
    top: 0;
    z-index: 1;
  }

  .mobile-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--size-2);
    padding: var(--size-3) var(--size-4);
    background: var(--surface-1);
    color: var(--text-1);
    border: 1px solid var(--surface-3);
    border-radius: var(--radius-2);
    font-size: var(--font-size-2);
    font-weight: var(--font-weight-5);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .mobile-btn:hover {
    background: var(--surface-3);
    border-color: var(--brand);
  }

  .sidebar {
    display: none;
  }

  .main-content {
    flex-direction: column;
    padding: var(--size-4);
    gap: var(--size-4);
  }

  .preview-section {
    align-items: stretch;
  }

  .desktop-only {
    display: none;
  }

  .card-preview {
    padding: var(--size-4);
    min-height: auto;
  }

  .controls-section {
    display: none;
  }
}
</style>
