<script setup lang="ts">
import { Icon } from '@iconify/vue';
import {
  CARD_KINDS,
  FACTIONS,
  type CardKind,
  type Faction
} from '@game/engine/src/card/card.enums';
import { uppercaseFirstLetter } from '@game/shared';
import UiSimpleTooltip from '@/ui/components/UiSimpleTooltip.vue';
import { useCollectionPage } from './useCollectionPage';
import { assets } from '@/assets';
import FancyButton from '@/ui/components/FancyButton.vue';
import {
  PopoverRoot,
  PopoverTrigger,
  PopoverPortal,
  PopoverContent
} from 'reka-ui';

const {
  textFilter,
  hasKindFilter,
  toggleKindFilter,
  hasFactionFilter,
  toggleFactionFilter,
  viewMode
} = useCollectionPage();

const isFiltersOpen = ref(false);

const cardKinds: Array<{
  id: CardKind;
  img: string;
  label: string;
  color: string;
}> = Object.values(CARD_KINDS).map(kind => ({
  id: kind,
  img: assets[`ui/card-kind-${kind.toLocaleLowerCase()}`].path,
  label: uppercaseFirstLetter(kind),
  color: 'white'
}));

const factions: Array<{
  id: string;
  img: string;
  label: string;
  faction: Faction;
}> = Object.values(FACTIONS).map(faction => ({
  id: faction.id,
  img: assets[`ui/card/faction-${faction.id.toLocaleLowerCase()}`].path,
  label: faction.name,
  faction
}));

const router = useRouter();
</script>

<template>
  <header class="filters-header">
    <FancyButton
      v-if="router.currentRoute.value.name !== 'ClientHome'"
      text="Back"
      size="md"
      @click="router.push({ name: 'ClientHome' })"
    />

    <input
      v-model="textFilter"
      type="text"
      placeholder="Search cards..."
      class="search-input"
    />

    <UiSimpleTooltip>
      <template #trigger>
        <label class="view-toggle" :class="{ active: viewMode === 'expanded' }">
          <Icon icon="material-symbols-light:view-column-2" width="1.5rem" />
          <input
            v-model="viewMode"
            type="radio"
            value="expanded"
            class="sr-only"
          />
        </label>
      </template>
      Normal view
    </UiSimpleTooltip>

    <UiSimpleTooltip>
      <template #trigger>
        <label class="view-toggle" :class="{ active: viewMode === 'compact' }">
          <Icon icon="heroicons:squares-2x2-16-solid" width="1.5rem" />
          <input
            v-model="viewMode"
            type="radio"
            value="compact"
            class="sr-only"
          />
        </label>
      </template>
      Compact view
    </UiSimpleTooltip>

    <PopoverRoot v-model:open="isFiltersOpen">
      <PopoverTrigger as-child>
        <FancyButton text="Filters" />
      </PopoverTrigger>

      <PopoverPortal>
        <PopoverContent
          class="filters-popover surface"
          side="bottom"
          align="center"
          :side-offset="8"
        >
          <section class="filter-section">
            <h4 class="filter-title">Faction</h4>
            <div class="faction-filter">
              <button
                v-for="faction in factions"
                :key="faction.id"
                :class="{ active: hasFactionFilter(faction.faction) }"
                :aria-label="faction.label"
                @click="toggleFactionFilter(faction.faction)"
              >
                <img :src="faction.img" :alt="faction.label" />
              </button>
            </div>
          </section>

          <section class="filter-section">
            <h4 class="filter-title">Card Type</h4>
            <div class="kind-filter">
              <button
                v-for="kind in cardKinds"
                :key="kind.label"
                :class="{ active: hasKindFilter(kind.id) }"
                :style="{ '--color': kind.color }"
                :aria-label="kind.label"
                @click="toggleKindFilter(kind.id)"
              >
                <img :src="kind.img" :alt="kind.label" />
              </button>
            </div>
          </section>
        </PopoverContent>
      </PopoverPortal>
    </PopoverRoot>
  </header>
</template>

<style scoped lang="postcss">
.filters-header {
  display: flex;
  gap: var(--size-3);
  align-items: center;
  padding: var(--size-3);
  background: var(--surface-1);
  border-radius: var(--radius-2);
}

.search-input {
  flex: 1;
  margin-left: auto;
  max-width: 400px;
  padding: var(--size-2) var(--size-4);
  border-radius: var(--radius-pill);
  border: solid var(--border-size-1) #b96b45;
  background-color: var(--color-gray-1);
  color: var(--color-gray-9);
  transition: border-color 0.2s var(--ease-1);

  &::placeholder {
    color: var(--color-gray-6);
    font-style: italic;
  }

  &:focus {
    border-color: #ffb270;
    outline: none;
  }
}

.view-toggle {
  cursor: url('@/assets/ui/cursor-hover.png'), auto;
  padding: var(--size-2);
  border-radius: var(--radius-2);
  display: flex;
  align-items: center;
  justify-content: center;
  border: solid var(--border-size-2) transparent;
  transition: all 0.2s var(--ease-1);
  color: var(--color-gray-7);

  &:hover {
    background-color: var(--color-gray-2);
    color: var(--color-gray-9);
  }

  &.active {
    background-color: hsl(from #b96b45 h s l / 0.2);
    border-color: #b96b45;
    color: #b96b45;
  }
}

.filters-popover {
  min-width: 300px;
  box-shadow: var(--shadow-4);
  z-index: 50;

  &[data-state='open'] {
    animation: slideDown 0.2s var(--ease-out-3);
  }

  &[data-state='closed'] {
    animation: slideUp 0.2s var(--ease-in-3);
  }
}

.filter-section {
  & + & {
    margin-top: var(--size-4);
    padding-top: var(--size-4);
    border-top: solid var(--border-size-1) var(--color-gray-4);
  }
}

.filter-title {
  font-size: var(--font-size-2);
  font-weight: 700;
  color: var(--color-gray-9);
  margin-bottom: var(--size-3);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.faction-filter {
  display: flex;
  flex-wrap: wrap;
  gap: var(--size-2);

  button {
    cursor: url('@/assets/ui/cursor-hover.png'), auto;
    border: solid var(--border-size-2) transparent;
    border-radius: var(--radius-pill);
    padding: var(--size-1);
    display: flex;
    align-items: center;
    background-color: var(--color-gray-2);
    transition: all 0.2s var(--ease-1);

    &:hover {
      background-color: var(--color-gray-3);
      transform: scale(1.05);
    }

    &.active {
      background-color: hsl(from var(--color) h s l / 0.25);
      border-color: var(--color);
      box-shadow: 0 0 10px hsl(from var(--color) h s l / 0.3);
    }

    & > img {
      width: 32px;
      height: 32px;
      object-fit: contain;
    }
  }
}

.kind-filter {
  display: flex;
  flex-wrap: wrap;
  gap: var(--size-2);

  button {
    cursor: url('@/assets/ui/cursor-hover.png'), auto;
    border: solid var(--border-size-2) transparent;
    border-radius: var(--radius-pill);
    padding: var(--size-1);
    display: flex;
    align-items: center;
    background-color: var(--color-gray-2);
    transition: all 0.2s var(--ease-1);

    &:hover {
      background-color: var(--color-gray-3);
      transform: scale(1.05);
    }

    &.active {
      background-color: hsl(from var(--color) h s l / 0.25);
      border-color: var(--color);
      box-shadow: 0 0 10px hsl(from var(--color) h s l / 0.3);
    }

    & > img {
      width: 32px;
      height: 32px;
      object-fit: contain;
    }
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideUp {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-10px);
  }
}
</style>
