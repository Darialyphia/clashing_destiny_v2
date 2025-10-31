<script setup lang="ts">
import type { HeroBlueprint } from '@game/engine/src/card/card-blueprint';
import { CARD_KINDS, type SpellSchool } from '@game/engine/src/card/card.enums';
import { CARDS_DICTIONARY } from '@game/engine/src/card/sets';
import {
  HoverCardContent,
  HoverCardPortal,
  HoverCardRoot,
  HoverCardTrigger
} from 'reka-ui';

export type DisplayedDeck = {
  name: string;
  spellSchools: SpellSchool[];
  mainDeck: { blueprintId: string; copies: number }[];
  destinyDeck: { blueprintId: string; copies: number }[];
};
const { deck } = defineProps<{
  deck: DisplayedDeck;
}>();

const hero = computed(() => {
  const heroes = deck.destinyDeck
    .map(card => CARDS_DICTIONARY[card.blueprintId])
    .filter(c => c.kind === CARD_KINDS.HERO);
  return heroes.sort((a, b) => b.level - a.level)[0];
});

const mainDeck = computed(() =>
  deck.mainDeck.map(card => ({
    ...card,
    blueprint: CARDS_DICTIONARY[card.blueprintId]
  }))
);
const destinyDeck = computed(() =>
  deck.destinyDeck.map(card => ({
    ...card,
    blueprint: CARDS_DICTIONARY[card.blueprintId]
  }))
);
const heroes = computed(() =>
  destinyDeck.value
    .filter(item => item.blueprint.kind === CARD_KINDS.HERO)
    .sort(
      (a, b) =>
        (a.blueprint as HeroBlueprint).level -
        (b.blueprint as HeroBlueprint).level
    )
);
const otherDestinyCards = computed(() =>
  destinyDeck.value.filter(item => item.blueprint.kind !== CARD_KINDS.HERO)
);

const minions = computed(() =>
  mainDeck.value.filter(item => item.blueprint.kind === CARD_KINDS.MINION)
);

const spells = computed(() =>
  mainDeck.value.filter(item => item.blueprint.kind === CARD_KINDS.SPELL)
);

const artifacts = computed(() =>
  mainDeck.value.filter(item => item.blueprint.kind === CARD_KINDS.ARTIFACT)
);

const sigils = computed(() =>
  mainDeck.value.filter(item => item.blueprint.kind === CARD_KINDS.SIGIL)
);
</script>

<template>
  <div>
    <HoverCardRoot>
      <HoverCardTrigger as-child>
        <button
          class="player-deck"
          :style="{
            '--bg': `url(/assets/cards/${hero?.cardIconId}.png)`
          }"
        >
          <div class="deck-name">
            {{ deck.name }}
            <div class="flex gap-1" v-if="hero">
              <img
                v-for="spellSchool in deck.spellSchools"
                :key="spellSchool"
                :src="`/assets/ui/spell-school-${spellSchool.toLowerCase()}.png`"
                class="spell-school"
              />
            </div>
          </div>
        </button>
      </HoverCardTrigger>

      <HoverCardPortal>
        <HoverCardContent side="left" align="center" :side-offset="8">
          <div class="deck-details">
            <ul>
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
              <li v-for="item in sigils" :key="item.blueprint.id">
                {{ item.copies }}x
                <span :class="item.blueprint.rarity.toLocaleLowerCase()">
                  {{ item.blueprint.name }}
                </span>
              </li>
            </ul>
            <ul>
              <li
                v-for="item in heroes"
                :key="item.blueprint.id"
                :class="item.blueprint.rarity.toLocaleLowerCase()"
              >
                {{ item.copies }}x {{ item.blueprint.name }}
              </li>

              <li
                v-for="item in otherDestinyCards"
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
