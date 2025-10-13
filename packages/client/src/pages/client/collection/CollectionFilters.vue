<script setup lang="ts">
import { Icon } from '@iconify/vue';
import {
  SPELL_SCHOOLS,
  CARD_KINDS,
  type SpellSchool,
  type CardKind,
  type HeroJob,
  HERO_JOBS
} from '@game/engine/src/card/card.enums';
import { uppercaseFirstLetter } from '@game/shared';
import UiSimpleTooltip from '@/ui/components/UiSimpleTooltip.vue';
import { useCollectionPage } from './useCollectionPage';

const {
  textFilter,
  hasSpellSchoolFilter,
  toggleSpellSchoolFilter,
  clearSpellSchoolFilter,
  hasJobFilter,
  toggleJobFilter,
  clearJobFilter,
  hasKindFilter,
  toggleKindFilter,
  hasSpeedFilter,
  toggleSpeedFilter,
  viewMode
} = useCollectionPage();

const spellSchools: Array<{
  id: SpellSchool;
  img: string;
  label: string;
  color: string;
}> = Object.values(SPELL_SCHOOLS).map(spellSchool => ({
  id: spellSchool,
  img: `/assets/ui/spell-school-${spellSchool.toLocaleLowerCase()}.png`,
  label: uppercaseFirstLetter(spellSchool.toLocaleLowerCase()),
  color: 'white'
}));

const heroJobs: Array<{
  id: HeroJob;
  img: string;
  label: string;
  color: string;
}> = Object.values(HERO_JOBS).map(job => ({
  id: job,
  img: `/assets/ui/jobs-${job.toLocaleLowerCase()}.png`,
  label: uppercaseFirstLetter(job.toLocaleLowerCase()),
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
      <h4>Spell Schools</h4>
      <div class="filter">
        <UiSimpleTooltip
          v-for="spellSchool in spellSchools"
          :key="spellSchool.label"
        >
          <template #trigger>
            <button
              :class="hasSpellSchoolFilter(spellSchool.id) && 'active'"
              :style="{ '--color': spellSchool.color }"
              :aria-label="spellSchool.label"
              @click="toggleSpellSchoolFilter(spellSchool.id)"
            >
              <img :src="spellSchool.img" :alt="spellSchool.label" />
            </button>
          </template>
          {{ spellSchool.label }}
        </UiSimpleTooltip>
      </div>
      <button class="clear-button" @click="clearSpellSchoolFilter">
        Clear
      </button>
    </section>

    <section>
      <h4>Hero Class</h4>
      <div class="filter">
        <UiSimpleTooltip v-for="heroJob in heroJobs" :key="heroJob.label">
          <template #trigger>
            <button
              :class="hasJobFilter(heroJob.id) && 'active'"
              :style="{ '--color': heroJob.color }"
              :aria-label="heroJob.label"
              @click="toggleJobFilter(heroJob.id)"
            >
              <img :src="heroJob.img" :alt="heroJob.label" />
            </button>
          </template>
          {{ heroJob.label }}
        </UiSimpleTooltip>
      </div>
      <button class="clear-button" @click="clearJobFilter">Clear</button>
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
.filter {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--size-1);
  --pixel-scale: 3;

  button {
    border: solid var(--border-size-2) transparent;
    border-radius: var(--radius-pill);
    width: calc(var(--pixel-scale) * 22px);
    height: calc(var(--pixel-scale) * 20px);
    aspect-ratio: 1;
    padding: 0;
    display: grid;
    > img {
      width: 100%;
      height: 100%;
    }
    &:not(.active) {
      filter: brightness(70%);
    }
    &.active {
      background-color: hsl(from var(--color) h s l / 0.25);
      /* border-color: var(--color); */
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
