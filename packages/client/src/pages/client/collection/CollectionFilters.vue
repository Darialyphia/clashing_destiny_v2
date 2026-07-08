<script setup lang="ts">
import {
  CARD_KINDS,
  AFFINITIES,
  RARITIES,
  type CardKind,
  type Affinity,
  type Rarity
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
import UiSwitch from '@/ui/components/UiSwitch.vue';
import { SliderRange, SliderRoot, SliderThumb, SliderTrack } from 'reka-ui';
import { Icon } from '@iconify/vue';

const {
  textFilter,
  hasKindFilter,
  toggleKindFilter,
  clearKindFilter,
  manaCostFilter,
  includeUnowned,
  cardScale,
  hasRarityFilter,
  toggleRarityFilter,
  clearRarityFilter,
  hasAffinityFilter,
  toggleAffinityFilter,
  clearAffinityFilter
} = useCollectionPage();

const activeFilterCount = computed(() => {
  let count = 0;
  if (manaCostFilter.value !== null) count++;
  for (const kind of Object.values(CARD_KINDS)) {
    if (hasKindFilter(kind)) {
      count++;
      break;
    }
  }
  for (const affinity of Object.values(AFFINITIES)) {
    if (hasAffinityFilter(affinity)) {
      count++;
      break;
    }
  }
  for (const rarity of rarities) {
    if (hasRarityFilter(rarity.id)) {
      count++;
      break;
    }
  }
  return count;
});

const clearAllFilters = () => {
  clearKindFilter();
  clearRarityFilter();
  clearAffinityFilter();
  manaCostFilter.value = null;
};
const isFiltersOpen = ref(false);

const cardKinds: Array<{
  id: CardKind;
  img: string;
  label: string;
  color: string;
}> = Object.values(CARD_KINDS).map(kind => ({
  id: kind,
  img: assets[`ui/card/kind-${kind.toLocaleLowerCase()}`].path,
  label: uppercaseFirstLetter(kind),
  color: 'white'
}));

const affinities: Array<{ id: Affinity; img: string; label: string }> =
  Object.values(AFFINITIES).map(affinity => ({
    id: affinity,
    img: assets[`ui/card/affinity-${affinity.toLocaleLowerCase()}`].path,
    label: uppercaseFirstLetter(affinity.toLocaleLowerCase())
  }));

const rarities: Array<{ id: Rarity; img: string; label: string }> =
  Object.values(RARITIES)
    .filter(r => r !== RARITIES.TOKEN && r !== RARITIES.BASIC)
    .map(rarity => {
      return {
        id: rarity,
        img: assets[`ui/card/rarity-${rarity.toLocaleLowerCase()}`].path,
        label: uppercaseFirstLetter(rarity.toLocaleLowerCase())
      };
    });

const router = useRouter();

const toggleManaFilter = (cost: number) => {
  if (manaCostFilter.value?.min === cost) {
    manaCostFilter.value = null;
  } else {
    manaCostFilter.value = { min: cost, max: cost };
  }
};

const toggleMinManaCostFilter = (cost: number) => {
  if (manaCostFilter.value?.min === cost) {
    manaCostFilter.value = null;
  } else {
    manaCostFilter.value = { min: cost, max: Infinity };
  }
};
</script>

<template>
  <header class="filters-header surface">
    <FancyButton
      v-if="router.currentRoute.value.name !== 'ClientHome'"
      text="Back"
      size="md"
      @click="router.push({ name: 'ClientHome' })"
    />

    <Icon icon="material-symbols:zoom-in" width="2rem" />
    <SliderRoot
      v-model="cardScale"
      :min="0.5"
      :max="2"
      :step="0.25"
      class="card-scale"
    >
      <SliderTrack class="card-scale-track">
        <SliderRange class="card-scale-range" />
      </SliderTrack>
      <SliderThumb class="card-scale-thumb" />
    </SliderRoot>

    <input
      v-model="textFilter"
      type="text"
      placeholder="Search cards..."
      class="search-input"
    />

    <PopoverRoot v-model:open="isFiltersOpen">
      <PopoverTrigger as-child>
        <div class="filter-btn-wrapper">
          <FancyButton text="Filters" />
          <span v-if="activeFilterCount > 0" class="filter-badge">
            {{ activeFilterCount }}
          </span>
        </div>
      </PopoverTrigger>

      <PopoverPortal>
        <PopoverContent
          class="filters-popover surface"
          side="bottom"
          align="center"
          :side-offset="8"
        >
          <section class="filter-section">
            <h4 class="filter-title flex gap-3 items-center">
              Include Unowned
              <UiSwitch v-model="includeUnowned" />

              <button
                v-if="activeFilterCount > 0"
                class="clear-all-btn"
                @click="clearAllFilters"
              >
                <Icon icon="material-symbols:close" width="0.85rem" />
                Clear all filters
              </button>
            </h4>
          </section>

          <section class="filter-section">
            <h4 class="filter-title">Card Type</h4>
            <div class="kind-filter">
              <UiSimpleTooltip
                v-for="kind in cardKinds"
                :key="kind.id"
                side="top"
                use-portal
              >
                <template #trigger>
                  <button
                    :class="{ active: hasKindFilter(kind.id) }"
                    :style="{ '--color': kind.color }"
                    :aria-label="kind.label"
                    @click="toggleKindFilter(kind.id)"
                  >
                    <img :src="kind.img" :alt="kind.label" />
                  </button>
                </template>
                {{ uppercaseFirstLetter(kind.label.toLocaleLowerCase()) }}
              </UiSimpleTooltip>
            </div>
          </section>

          <section class="filter-section">
            <h4 class="filter-title">Mana Cost</h4>
            <div class="flex gap-2">
              <button
                v-for="cost in [0, 1, 2, 3, 4, 5]"
                :key="cost"
                :class="{ active: manaCostFilter?.min === cost }"
                class="mana-cost"
                @click="toggleManaFilter(cost)"
              >
                {{ cost }}
              </button>
              <button
                :class="{ active: manaCostFilter?.min === 6 }"
                class="mana-cost"
                @click="toggleMinManaCostFilter(6)"
              >
                6+
              </button>
            </div>
          </section>

          <section class="filter-section">
            <h4 class="filter-title">Affinity</h4>
            <div class="affinity-filter">
              <UiSimpleTooltip
                v-for="affinity in affinities"
                :key="affinity.id"
                side="top"
                use-portal
              >
                <template #trigger>
                  <button
                    :class="{ active: hasAffinityFilter(affinity.id) }"
                    :aria-label="affinity.label"
                    @click="toggleAffinityFilter(affinity.id)"
                  >
                    <img :src="affinity.img" :alt="affinity.label" />
                  </button>
                </template>
                {{ affinity.label }}
              </UiSimpleTooltip>
            </div>
          </section>

          <section class="filter-section">
            <h4 class="filter-title">Rarity</h4>
            <div class="rarity-filter">
              <UiSimpleTooltip
                v-for="rarity in rarities"
                :key="rarity.id"
                side="top"
                use-portal
              >
                <template #trigger>
                  <button
                    :class="{ active: hasRarityFilter(rarity.id) }"
                    :aria-label="rarity.label"
                    @click="toggleRarityFilter(rarity.id)"
                  >
                    <img :src="rarity.img" :alt="rarity.label" />
                  </button>
                </template>
                {{ rarity.label }}
              </UiSimpleTooltip>
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
  border-radius: var(--radius-2);
}

.filter-btn-wrapper {
  position: relative;
  display: inline-flex;
}

.filter-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  border-radius: var(--radius-pill);
  background-color: var(--red-6);
  color: white;
  font-size: 11px;
  font-weight: 700;
  line-height: 18px;
  text-align: center;
  pointer-events: none;
  z-index: 1;
}

.clear-all-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--size-1);
  padding: var(--size-1) var(--size-2);
  border-radius: var(--radius-pill);
  border: solid var(--border-size-1) var(--color-red-6);
  background: transparent;
  color: var(--color-red-6);
  font-size: var(--font-size-0);
  cursor: url('@/assets/ui/cursor-hover.png'), auto;
  transition: all 0.15s var(--ease-1);

  &:hover {
    background-color: hsl(from var(--color-red-6) h s l / 0.1);
  }
}

.search-input {
  flex: 1;
  margin-left: auto;
  max-width: 400px;
  padding: var(--size-2) var(--size-4);
  border-radius: var(--radius-pill);
  border: solid var(--border-size-1) #d1c6c2;
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

.filters-popover {
  min-width: 300px;
  box-shadow: var(--shadow-4);
  z-index: 50;
  position: relative;

  &[data-state='open'] {
    animation: slideDown 0.2s var(--ease-out-3);
  }

  &[data-state='closed'] {
    animation: slideUp 0.2s var(--ease-in-3);
  }
}

.filter-section {
  & + & {
    margin-top: var(--size-2);
    border-top: solid var(--border-size-1) var(--color-gray-4);
  }
}

.filter-title {
  font-size: var(--font-size-0);
  font-weight: 300;
  text-transform: capitalize;
  letter-spacing: 0.05em;
}

.faction-filter {
  display: flex;
  flex-wrap: wrap;

  button {
    cursor: url('@/assets/ui/cursor-hover.png'), auto;
    border: solid var(--border-size-2) transparent;
    border-radius: var(--radius-pill);
    padding: var(--size-1);
    display: flex;
    align-items: center;
    background-color: var(--color-gray-2);

    &:hover {
      filter: brightness(1.2);
    }

    &.active {
      background-color: hsl(from var(--color) h s l / 0.25);
      border-color: var(--color);
      box-shadow: 0 0 10px hsl(from var(--color) h s l / 0.3);
    }

    & > img {
      width: calc(24px * var(--pixel-scale));
      aspect-ratio: 1;
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

.affinity-filter,
.rarity-filter {
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
      background-color: hsl(from var(--color-accent) h s l / 0.25);
      border-color: var(--color-accent);
      box-shadow: 0 0 10px hsl(from var(--color-accent) h s l / 0.3);
    }
  }
}

.rarity-filter button {
  & > img {
    width: 28px;
    height: 36px;
    object-fit: contain;
  }
}

.affinity-filter button {
  & > img {
    width: 60px;
    height: 60px;
    object-fit: contain;
  }
}

.mana-cost {
  background-image: url('@/assets/ui/card/mana-cost.png');
  background-size: cover;
  font-weight: 700;
  font-size: var(--font-size-2);
  width: 48px;
  aspect-ratio: 1;

  &.active {
    filter: drop-shadow(0 0 5px hsl(from #4a90e2 h s l / 0.8)) brightness(1.25);
  }

  @screen lt-lg {
    display: none;
  }
}
.destiny-cost {
  background-image: url('@/assets/ui/card/destiny-cost.png');
  background-size: cover;
  font-weight: 700;
  font-size: var(--font-size-2);
  width: 48px;
  aspect-ratio: 1;
  &.active {
    filter: drop-shadow(0 0 5px hsl(from #b945a3 h s l / 0.8)) brightness(1.25);
  }

  @screen lt-lg {
    display: none;
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

.card-scale {
  position: relative;
  display: flex;
  align-items: center;
  user-select: none;
  touch-action: none;
  width: 200px;
  height: 20px;
  z-index: 1;
}

.card-scale-track {
  background-color: var(--red-5);
  position: relative;
  flex-grow: 1;
  border-radius: var(--radius-pill);
  height: 3px;
}

.card-scale-range {
  position: absolute;
  background-color: white;
  border-radius: var(--radius-pill);
  height: 100%;
}

.card-scale-thumb {
  display: block;
  width: var(--size-4);
  height: var(--size-4);
  background-color: white;
  border-radius: var(--radius-3);
}
.card-scale-thumb:hover {
  background-color: var(--primary);
}
.card-scale-thumb:focus {
  outline: none;
  box-shadow: 0 0 0 5px var(--primary-dark);
}
</style>
