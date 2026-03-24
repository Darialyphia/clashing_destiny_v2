<script setup lang="ts">
import { CARD_KINDS } from '@game/engine/src/card/card.enums';
import { CARDS_DICTIONARY } from '@game/engine/src/card/sets';
import {
  HoverCardContent,
  HoverCardPortal,
  HoverCardRoot,
  HoverCardTrigger
} from 'reka-ui';
import { assets } from '@/assets';
import type { HeroBlueprint } from '@game/engine/src/card/card-blueprint';
import FancyButton from '@/ui/components/FancyButton.vue';
import type { Nullable } from '@game/shared';

export type DisplayedDeck = {
  name: string;
  hero: Nullable<{ blueprintId: string }>;
  mainDeck: { blueprintId: string; copies: number }[];
  runeDeck: { blueprintId: string; copies: number }[];
};
const { deck } = defineProps<{
  deck: DisplayedDeck;
}>();

const mainDeck = computed(() =>
  deck.mainDeck.map(card => ({
    ...card,
    blueprint: CARDS_DICTIONARY[card.blueprintId]
  }))
);
const runeDeck = computed(() =>
  deck.runeDeck.map(card => ({
    ...card,
    blueprint: CARDS_DICTIONARY[card.blueprintId]
  }))
);

const hero = computed(() => {
  if (!deck.hero) return null;
  const blueprint = CARDS_DICTIONARY[deck.hero.blueprintId] as HeroBlueprint;
  return blueprint;
});

const minions = computed(() =>
  mainDeck.value.filter(item => item.blueprint.kind === CARD_KINDS.MINION)
);

const spells = computed(() =>
  mainDeck.value.filter(item => item.blueprint.kind === CARD_KINDS.SPELL)
);

const artifacts = computed(() =>
  mainDeck.value.filter(item => item.blueprint.kind === CARD_KINDS.ARTIFACT)
);
</script>

<template>
  <div>
    <HoverCardRoot :open-delay="200">
      <button
        class="player-deck"
        :style="{
          '--bg': assets[`cards/${hero?.art.default.main}`]?.css
        }"
      >
        <div class="deck-name">
          {{ deck.name }}
        </div>

        <HoverCardTrigger as-child>
          <FancyButton as="div" text="?"></FancyButton>
        </HoverCardTrigger>
      </button>

      <HoverCardPortal>
        <HoverCardContent side="right" align="center" :side-offset="8">
          <div class="deck-details">
            <ul>
              <li v-if="hero" :class="hero.rarity.toLocaleLowerCase()">
                1 x {{ hero.name }}
              </li>
              <li v-for="item in minions" :key="item.blueprint.id">
                {{ item.copies }}x
                <span :class="item.blueprint.rarity.toLocaleLowerCase()">
                  {{ item.blueprint.name }}
                </span>
              </li>
              <li v-for="item in spells" :key="item.blueprint.id">
                {{ item.copies }}x
                <span :class="item.blueprint.rarity.toLocaleLowerCase()">
                  {{ item.blueprint.name }}
                </span>
              </li>
              <li v-for="item in artifacts" :key="item.blueprint.id">
                {{ item.copies }}x
                <span :class="item.blueprint.rarity.toLocaleLowerCase()">
                  {{ item.blueprint.name }}
                </span>
              </li>
            </ul>
            <ul>
              <li
                v-for="item in runeDeck"
                :key="item.blueprint.id"
                :class="item.blueprint.rarity.toLocaleLowerCase()"
              >
                {{ item.copies }}x {{ item.blueprint.name }}
              </li>
            </ul>
          </div>
        </HoverCardContent>
      </HoverCardPortal>
    </HoverCardRoot>
  </div>
</template>

<style scoped lang="postcss">
.player-deck {
  display: flex;
  width: 100%;
  gap: var(--size-2);
  align-items: center;
  background-image:
    linear-gradient(to right, hsl(0deg 0% 20% / 0.5), hsl(0deg 0% 0% / 0.5)),
    var(--bg);
  background-repeat: no-repeat;
  background-position:
    center center,
    right calc(100% + 70px);
  background-size: 200%, calc(2px * 96);
  padding: var(--size-2) var(--size-4);
  border: solid 1px hsl(var(--color-primary-hsl) / 0.5);
}

.deck-name {
  flex: 1 1 0%;
  text-align: left;
  align-self: stretch;
  font-size: var(--font-size-3);
  font-weight: var(--font-weight-7);
  text-shadow: 0 0 1rem 1rem black;
  -webkit-text-stroke: 3px black;
  paint-order: stroke fill;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  @screen lt-lg {
    font-size: var(--font-size-1);
  }
}

.deck-details {
  padding: var(--size-4);
  --un-bg-opacity: 1;
  background-color: hsl(var(--gray-10-hsl) / var(--un-bg-opacity));
  border-radius: var(--radius-2);
  box-shadow: var(--shadow-3);
  color: white;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.rare {
  color: var(--blue-4);
}

.epic {
  color: var(--purple-4);
}

.legendary {
  color: var(--orange-4);
}
</style>
