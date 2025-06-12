<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { useLocalStorage } from '@vueuse/core';
import BlueprintCard from '@/card/components/BlueprintCard.vue';
import { domToPng } from 'modern-screenshot';

import { DeckBuildervModel } from '@/card/deck-builder.model';
import { keyBy } from 'lodash-es';
import FancyButton from '@/ui/components/FancyButton.vue';
import { Icon } from '@iconify/vue';
import { useCardList } from '@/card/composables/useCardList';
import {
  AFFINITIES,
  CARD_KINDS,
  type Affinity,
  type CardKind
} from '@game/engine/src/card/card.enums';
import { vIntersectionObserver } from '@vueuse/components';
import type { ValidatableDeck } from '@game/engine/src/card/validators/deck.validator';
import { StandardDeckValidator } from '@game/engine/src/card/validators/deck.validator';
import { uppercaseFirstLetter } from '@game/shared';
import UiSimpleTooltip from '@/ui/components/UiSimpleTooltip.vue';

definePage({
  name: 'Collection'
});

const {
  cards,
  hasAffinityFilter,
  toggleAffinityFilter,
  hasKindFilter,
  toggleKindFilter,
  textFilter
} = useCardList();

const decks = useLocalStorage<ValidatableDeck[]>(
  'clashing-destinies-decks',
  []
);
const collection = computed(() =>
  cards.value.map(card => ({ blueprint: card, copiesOwned: 4 }))
);

const deckBuilder = ref(
  new DeckBuildervModel(
    collection.value,
    new StandardDeckValidator(keyBy(cards.value, 'id'))
  )
);

const isEditing = ref(false);
const createDeck = () => {
  deckBuilder.value.reset();
  isEditing.value = true;
};

const editDeck = (deck: ValidatableDeck) => {
  deckBuilder.value.loadDeck(deck);
  isEditing.value = true;
};

const screenshot = async (id: string, e: MouseEvent) => {
  const card = (e.target as HTMLElement)
    .closest('li')
    ?.querySelector('.card-front') as HTMLElement;
  const png = await domToPng(card, {
    backgroundColor: 'transparent'
  });
  const a = document.createElement('a');
  a.href = png;
  a.download = `${id}.png`;
  a.click();
};

const saveDeck = () => {
  const existingDeck = decks.value.find(
    deck => deck.id === deckBuilder.value.deck.id
  );
  if (existingDeck) {
    existingDeck.name = deckBuilder.value.deck.name;
    existingDeck.mainDeck = deckBuilder.value.deck.mainDeck;
    existingDeck.destinyDeck = deckBuilder.value.deck.destinyDeck;
  } else {
    decks.value.push(deckBuilder.value.deck);
  }
  isEditing.value = false;
  deckBuilder.value.reset();
};

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

const visibleCards = ref(new Set<string>());
const onIntersectionObserver =
  (cardId: string) => (entries: IntersectionObserverEntry[]) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        visibleCards.value.add(cardId);
      } else {
        visibleCards.value.delete(cardId);
      }
    });
  };

const listRoot = useTemplateRef('card-list');

const viewMode = ref<'normal' | 'small'>('normal');
</script>

<template>
  <div class="page">
    <header>
      <nav>
        <ul class="flex gap-4">
          <li>
            <RouterLink :to="{ name: 'Home' }">Home</RouterLink>
          </li>
          <li>
            <RouterLink :to="{ name: 'Sandbox' }">Sandbox</RouterLink>
          </li>
        </ul>
      </nav>
    </header>
    <aside class="filters">
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
                  value="normal"
                  class="sr-only"
                />
              </label>
            </template>
            Expanded view
          </UiSimpleTooltip>

          <UiSimpleTooltip>
            <template #trigger>
              <label>
                <Icon icon="heroicons:squares-2x2-16-solid" width="1.5rem" />
                <input
                  v-model="viewMode"
                  type="radio"
                  value="small"
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

    <ul ref="card-list" class="cards fancy-scrollbar" :class="viewMode">
      <li
        v-for="card in cards"
        :key="card.id"
        v-intersection-observer="[
          onIntersectionObserver(card.id),
          { root: listRoot }
        ]"
      >
        <Transition>
          <BlueprintCard
            v-if="visibleCards.has(card.id)"
            :blueprint="card"
            class="collection-card"
            :class="{ disabled: isEditing && !deckBuilder.canAdd(card.id) }"
            @click="
              () => {
                if (!isEditing) return;
                if (deckBuilder.canAdd(card.id)) {
                  deckBuilder.addCard(card.id);
                }
              }
            "
          />
        </Transition>
        <button
          v-if="!isEditing"
          @click="screenshot(card.id, $event)"
          class="absolute bottom-0"
        >
          Screenshot
        </button>
      </li>
    </ul>

    <aside class="decks">
      <template v-if="!isEditing">
        <p v-if="!decks.length">You haven't created any deck yet.</p>
        <ul class="mb-5">
          <li
            v-for="(deck, index) in decks"
            :key="index"
            class="flex gap-2 items-center"
          >
            <button class="flex-1 text-left" @click="editDeck(deck)">
              {{ deck.name }}
            </button>

            <FancyButton
              variant="error"
              text="Delete"
              @click="decks.splice(decks.indexOf(deck), 1)"
            />
          </li>
        </ul>
        <FancyButton
          class="primary-button"
          text="New Deck"
          @click="createDeck"
        />
      </template>

      <div class="deck" v-else>
        <div class="flex gap-2">
          <Icon icon="material-symbols:edit-outline" />
          <input v-model="deckBuilder.deck.name" type="text" />
        </div>
        <div class="overflow-y-auto fancy-scrollbar">
          <div class="text-3 my-5 font-500">
            Main deck ({{ deckBuilder.mainDeckSize }} /
            {{ deckBuilder.validator.mainDeckSize }})
          </div>
          <ul>
            <li
              v-for="(card, index) in deckBuilder.mainDeckCards"
              :key="index"
              :style="{
                '--bg': `url(/assets/icons/${card.blueprint.cardIconId}.png)`
              }"
              :class="card.blueprint.kind.toLocaleLowerCase()"
              class="deck-item"
              @click="deckBuilder.removeCard(card.blueprintId)"
            >
              <div class="mana-cost">{{ card.blueprint.manaCost }}</div>
              {{ card.blueprint.name }} X {{ card.copies }}
            </li>
          </ul>

          <div class="text-3 my-5 font-500">
            Destiny Deck ({{ deckBuilder.destinyDeckSize }} /
            {{ deckBuilder.validator.destinyDeckSize }})
          </div>
          <ul>
            <li
              v-for="(card, index) in deckBuilder.destinyDeckCards"
              :key="index"
              :style="{
                '--bg': `url(/assets/icons/${card.blueprint.cardIconId}.png)`
              }"
              :class="card.blueprint.kind.toLocaleLowerCase()"
              class="deck-item"
              @click="deckBuilder.removeCard(card.blueprintId)"
            >
              <div class="destiny-cost">{{ card.blueprint.destinyCost }}</div>
              {{ card.blueprint.name }} X {{ card.copies }}
            </li>
          </ul>
        </div>
        <div class="flex gap-2">
          <FancyButton text="Back" variat="error" @click="isEditing = false" />
          <FancyButton text="Save" @click="saveDeck" />
        </div>
      </div>
    </aside>
  </div>
</template>

<style scoped lang="postcss">
.page {
  overflow: hidden;
  height: 100dvh;
  pointer-events: auto;
  display: grid;
  grid-template-columns: auto 1fr var(--size-xs);
  grid-template-rows: auto 1fr;

  > header {
    grid-row: 1;
    grid-column: 1 / span 2;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-block: var(--size-3);
    padding-inline: var(--size-5);
  }
}

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

.decks {
  padding: var(--size-3);
  overflow-y: hidden;
  grid-row: 1 / -1;
  grid-column: 3;
}

.filters {
  grid-row: 2;
  grid-column: 1;
  padding: var(--size-3);
  display: flex;
  flex-direction: column;
  gap: var(--size-4);
}

.cards {
  --pixel-scale: 2;
  --min-column-size: 20rem;
  gap: var(--size-6);
  grid-column: 2;
  grid-row: 2;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(var(--min-column-size), 1fr));
  justify-items: center;
  overflow-y: auto;

  &.small {
    --pixel-scale: 1;
    --min-column-size: 10rem;
    .collection-card {
      transform: scale(0.5);
      transform-origin: top left;
    }
  }

  li {
    position: relative;
    width: calc(var(--card-width) * var(--pixel-scale));
    height: calc(var(--card-height) * var(--pixel-scale));
  }
}

.collection-card {
  &:is(.v-enter-active, .v-leave-active) {
    transition: all 0.7s var(--ease-spring-3);
  }

  &:is(.v-enter-from, .v-leave-to) {
    transform: translateY(15px);
    opacity: 0.5;
  }
}

.card.disabled {
  filter: grayscale(100%);
}

.card:not(.disabled):hover {
  cursor: url('/assets/ui/cursor-hover.png'), auto;
}

.deck {
  display: grid;
  grid-template-rows: auto 1fr auto;
  height: 100%;
}

.deck-item {
  display: flex;
  gap: var(--size-3);
  align-items: center;
  border: solid var(--border-size-1) #d7ad42;
  margin-block: var(--size-2);
  padding: var(--size-3);
  cursor: url('/assets/ui/cursor-hover.png'), auto;
  background-image: linear-gradient(
      hsl(0deg 0% 0% / 0.5),
      hsl(0deg 0% 0% / 0.5)
    ),
    var(--bg);
  background-repeat: no-repeat;
  background-position:
    center center,
    calc(100% + 40px) -70px;
  background-size: 200%, calc(2px * 96);
  text-shadow: 0 0 1rem 1rem black;
  transition: all 0.3s var(--ease-2);
  &.spell,
  &.artifact {
    background-position:
      center center,
      calc(100% + 40px);
  }

  &:hover {
    background-image: linear-gradient(
        hsl(0deg 0% 0% / 0.25),
        hsl(0deg 0% 0% / 0.25)
      ),
      var(--bg);
    background-size: 200%, calc(2.25 * 96px);
    background-position:
      center center,
      calc(100% + 50px) -85px;
  }
}

.mana-cost {
  background-color: #5185ff;
  font-size: var(--size-3);
  font-weight: var(--weight-500);
  font-weight: var(--font-weight-7);
  border-radius: var(--radius-round);
  width: var(--size-5);
  height: var(--size-5);
  display: grid;
  place-content: center;
  -webkit-text-stroke: 4px black;
  paint-order: stroke fill;
}

.destiny-cost {
  background-color: #feb500;
  font-size: var(--size-3);
  font-weight: var(--weight-500);
  font-weight: var(--font-weight-7);
  border-radius: var(--radius-round);
  width: var(--size-5);
  height: var(--size-5);
  display: grid;
  place-content: center;
  -webkit-text-stroke: 4px black;
  paint-order: stroke fill;
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
