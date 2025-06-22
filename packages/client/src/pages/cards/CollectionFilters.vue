<script setup lang="ts">
import { Icon } from '@iconify/vue';
import {
  AFFINITIES,
  CARD_KINDS,
  type Affinity,
  type CardKind
} from '@game/engine/src/card/card.enums';
import { uppercaseFirstLetter } from '@game/shared';
import UiSimpleTooltip from '@/ui/components/UiSimpleTooltip.vue';
import { useCollectionPage } from './useCollectionPage';

const {
  textFilter,
  hasAffinityFilter,
  hasKindFilter,
  toggleAffinityFilter,
  toggleKindFilter,
  viewMode
} = useCollectionPage();

const affinities: Array<{
  id: Affinity;
  img: string;
  label: string;
  color: string;
}> = Object.values(AFFINITIES).map(affinity => ({
  id: affinity,
  img: `/assets/ui/affinity-${affinity.toLocaleLowerCase()}.png`,
  label: uppercaseFirstLetter(affinity),
  color: 'white'
}));

const cardKinds: Array<{
  id: CardKind;
  img: string;
  label: string;
  color: string;
}> = Object.values(CARD_KINDS).map(kind => ({
  id: kind,
  img: `/assets/ui/card-kind-${kind.toLocaleLowerCase()}.png`,
  label: uppercaseFirstLetter(kind),
  color: 'white'
}));
</script>

<template>
  <aside class="flex flex-col gap-3 surface">
    <section class="flex gap-3 items-center">
      <input
        v-model="textFilter"
        type="text"
        placeholder="Search cards..."
        class="search-input"
      />
    </section>
    <section class="flex gap-3 items-center">
      <h4>Display</h4>
      <div class="flex gap-3">
        <UiSimpleTooltip>
          <template #trigger>
            <label class="view-toggle">
              <Icon
                icon="material-symbols-light:view-column-2"
                width="1.5rem"
              />
              <input
                v-model="viewMode"
                type="radio"
                value="expanded"
                class="sr-only"
              />
            </label>
          </template>
          Expanded view
        </UiSimpleTooltip>

        <UiSimpleTooltip>
          <template #trigger>
            <label class="view-toggle">
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
      </div>
    </section>

    <section>
      <h4>Affinities</h4>
      <div class="affinity-filter">
        <UiSimpleTooltip v-for="affinity in affinities" :key="affinity.label">
          <template #trigger>
            <button
              :class="hasAffinityFilter(affinity.id) && 'active'"
              :style="{ '--color': affinity.color }"
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

    <section>
      <h4>Card type</h4>
      <div class="kind-filter">
        <button
          v-for="kind in cardKinds"
          :key="kind.label"
          :class="hasKindFilter(kind.id) && 'active'"
          :style="{ '--color': kind.color }"
          :aria-label="kind.label"
          @click="toggleKindFilter(kind.id)"
        >
          <img :src="kind.img" :alt="kind.label" />
          {{ kind.label }}
        </button>
      </div>
    </section>
  </aside>
</template>

<style scoped lang="postcss">
.affinity-filter {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--size-1);

  button {
    border: solid var(--border-size-2) transparent;
    border-radius: var(--radius-pill);
    min-height: var(--size-8);
    aspect-ratio: 1;
    padding: 0;
    display: grid;
    > img {
      width: 100%;
      height: 100%;
    }
    &.active {
      background-color: hsl(from var(--color) h s l / 0.25);
      border-color: var(--color);
    }
  }
}

.kind-filter {
  display: flex;
  flex-direction: column;
  button {
    border: solid var(--border-size-2) transparent;
    border-radius: var(--radius-pill);
    text-align: left;
    display: flex;
    gap: var(--size-2);
    align-items: center;

    &.active {
      background-color: hsl(from var(--color) h s l / 0.25);
      border-color: var(--color);
    }

    & > img {
      width: 32px;
      aspect-ratio: 1;
    }
  }
}

.view-toggle {
  cursor: url('/assets/ui/cursor-hover.png'), auto;
}

.search-input {
  width: 100%;
  padding: var(--size-2) var(--size-4);
  border-radius: var(--radius-pill);
  border: solid var(--border-size-1) var(--gray-5);
  background-color: var(--color-gray-1);
  color: var(--color-gray-9);
  &::placeholder {
    color: var(--color-gray-6);
    font-style: italic;
  }
}
</style>
