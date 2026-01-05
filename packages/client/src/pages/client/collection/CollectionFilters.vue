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

const {
  textFilter,
  hasKindFilter,
  toggleKindFilter,
  hasFactionFilter,
  toggleFactionFilter,
  viewMode
} = useCollectionPage();

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
  <header class="flex gap-3 surface">
    <FancyButton
      v-if="router.currentRoute.value.name !== 'ClientHome'"
      text="Back"
      size="md"
      @click="router.push({ name: 'ClientHome' })"
    />
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
      <UiSimpleTooltip>
        <template #trigger>
          <label class="view-toggle">
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
    </section>

    <section>
      <div class="faction-filter">
        <button
          v-for="faction in factions"
          :key="faction.id"
          :class="hasFactionFilter(faction.faction) && 'active'"
          :aria-label="faction.label"
          @click="toggleFactionFilter(faction.faction)"
        >
          <img :src="faction.img" :alt="faction.label" />
        </button>
      </div>
    </section>

    <section>
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
        </button>
      </div>
    </section>
  </header>
</template>

<style scoped lang="postcss">
.faction-filter {
  display: flex;
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

.kind-filter {
  display: flex;
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
  cursor: url('@/assets/ui/cursor-hover.png'), auto;
}

.search-input {
  width: 100%;
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
</style>
