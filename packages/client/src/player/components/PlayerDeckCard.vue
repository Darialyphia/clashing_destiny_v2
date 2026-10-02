<script setup lang="ts">
import { keyBy } from 'lodash-es';
import {
  AFFINITIES,
  CARD_KINDS,
  type Affinity
} from '@game/engine/src/card/card.enums';
import {
  CARD_SET_DICTIONARY,
  CARDS_DICTIONARY
} from '@game/engine/src/card/sets';
import type { DeckValidationResult } from '@game/engine/src/card/validators/deck.validator';
import { sprites } from '@/assets';
import { useSprite } from '@/shared/composables/useSprite';
import { match } from 'ts-pattern';
import { ANIMATIONS_NAMES } from '@game/engine/src/game/game.enums';
import { assets } from '@/assets';
import UiDrawer from '@/ui/components/UiDrawer.vue';
import { StandardDeckValidator } from '@game/engine/src/card/validators/standard.validator';
import { DeckBuilderViewModel } from '@/card/deck-builder.model';
import type { CardId } from '@game/api';
import FancyButton from '@/ui/components/FancyButton.vue';
import BlueprintSmallCard from '@/card/components/BlueprintSmallCard.vue';
import type { CardBlueprint } from '@game/engine/src/card/card-blueprint';
import ManaCurveChart from './ManaCurveChart.vue';

export type DisplayedDeck = {
  id: string;
  name: string;
  cards: {
    blueprintId: string;
    copies: number;
    cardId: CardId;
    isFoil: boolean;
  }[];
  isValid: DeckValidationResult;
};
const { deck } = defineProps<{
  deck: DisplayedDeck;
}>();

const mainDeck = computed(() =>
  deck.cards.map(card => ({
    ...card,
    blueprint: CARDS_DICTIONARY[card.blueprintId]
  }))
);

const violations = computed(() =>
  deck.isValid.result === 'failure' ? deck.isValid.violations : []
);

const affinities = computed(() => {
  const result: Affinity[] = [];
  for (const aff of Object.values(AFFINITIES)) {
    if (aff === AFFINITIES.NEUTRAL) continue;
    const max = Math.max(
      ...mainDeck.value.map(
        item => item.blueprint.affinities.filter(a => a === aff).length
      )
    );

    result.push(...Array.from({ length: max }, () => aff));
  }

  return result;
});

const mostExpensiveCard = computed(() =>
  mainDeck.value.reduce((acc, current) => {
    if (current.blueprint.kind === CARD_KINDS.DESTINY) return acc;
    if (current.blueprint.kind === CARD_KINDS.RUNE) return acc;
    if (acc.blueprint.kind === CARD_KINDS.DESTINY) return current;
    if (acc.blueprint.kind === CARD_KINDS.RUNE) return current;
    if (current.blueprint.manaCost > acc.blueprint.manaCost) return current;
    return acc;
  }, mainDeck.value[0])
);

const sprite = computed(
  () => sprites[`cards/${mostExpensiveCard.value.blueprint.art.default.sprite}`]
);

const animationSequence = computed(() =>
  match(mostExpensiveCard.value.blueprint.kind)
    .with(CARD_KINDS.MINION, () => [ANIMATIONS_NAMES.BREATHING])
    .otherwise(() => [ANIMATIONS_NAMES.DEFAULT])
);
const { activeFrameRect, bgPosition, imageBg } = useSprite({
  animationSequence,
  sprite,
  kind: computed(() => mostExpensiveCard.value.blueprint.kind),
  scale: 1,
  repeat: true,
  scalePositionByPixelScale: true,
  animated: false
});

const isDetailsOpened = ref(false);

const allBlueprints = Object.values(CARD_SET_DICTIONARY).flatMap(
  set => set.cards
);

const deckBuilder = new DeckBuilderViewModel(
  allBlueprints,
  new StandardDeckValidator({ cardPool: keyBy(allBlueprints, 'id') })
);
watch(
  () => deck,
  newDeck => {
    deckBuilder.loadDeck({
      name: newDeck.name,
      id: newDeck.id,
      isEqual(first, second) {
        return first.meta.cardId === second.meta.cardId;
      },
      cards: newDeck.cards.map(card => ({
        blueprintId: card.blueprintId,
        copies: card.copies,
        meta: {
          isFoil: card.isFoil,
          cardId: card.cardId
        }
      }))
    });
  },
  { immediate: true }
);

const cards = computed(() => {
  // group foil ans non foil cards who share the same blueprint id
  // if a card only has a foil version, change isFoil to false
  const groupedCards: Record<
    string,
    Array<{ blueprint: CardBlueprint; copies: number }>
  > = {};
  for (const card of deckBuilder.mainDeckCards) {
    const id = card.blueprintId;
    if (!groupedCards[id]) groupedCards[id] = [];
    groupedCards[id].push({
      blueprint: card.blueprint,
      copies: card.copies
    });
  }

  const result: Array<{
    blueprint: CardBlueprint;
    copies: number;
  }> = [];
  for (const group of Object.values(groupedCards)) {
    result.push({
      blueprint: group[0].blueprint,
      copies: group.reduce((sum, card) => sum + card.copies, 0)
    });
  }

  return result;
});

const route = useRoute();
</script>

<template>
  <div class="relative">
    <button
      class="player-deck-card"
      :class="{
        invalid: deck.isValid.result === 'failure'
      }"
    >
      <div
        class="art"
        :class="[mostExpensiveCard.blueprint.kind.toLocaleLowerCase()]"
        :style="{
          '--bg-position': bgPosition,
          '--width': `${activeFrameRect.width}px`,
          '--height': `${activeFrameRect.height}px`,
          '--background-width': `calc(${sprite.sheetSize.w}px * var(--pixel-scale))`,
          '--background-height': `calc(${sprite.sheetSize.h}px * var(--pixel-scale))`
        }"
      >
        <div class="sprite" />
      </div>
      <div
        class="deck-name dual-text"
        :data-text="deck.name"
        style="--dual-text-stroke-offset-y: -2px"
      >
        {{ deck.name }}
      </div>
      <div class="affinities">
        <img
          v-for="aff in affinities"
          :key="aff"
          :src="assets[`ui/card/v3/affinity-${aff.toLocaleLowerCase()}`].path"
          :alt="aff"
          class="affinity"
        />
      </div>
    </button>

    <button
      class="details-toggle"
      aria-label="Toggle details"
      @click="isDetailsOpened = !isDetailsOpened"
    />
    <UiDrawer v-model:is-opened="isDetailsOpened" title="Deck details">
      <div class="deck-details surface">
        <div class="details-scroller fancy-scrollbar">
          <header class="relative">
            <div
              v-if="sprite"
              class="details-art"
              :class="[mostExpensiveCard.blueprint.kind.toLocaleLowerCase()]"
              :style="{
                '--bg-position': bgPosition,
                '--width': `${activeFrameRect.width}px`,
                '--height': `${activeFrameRect.height}px`,
                '--background-width': `calc(${sprite.sheetSize.w}px * var(--pixel-scale))`,
                '--background-height': `calc(${sprite.sheetSize.h}px * var(--pixel-scale))`
              }"
            >
              <div class="details-sprite" :style="{ '--bg': imageBg }" />
            </div>
            <div
              class="details-name dual-text"
              :data-text="deck.name"
              style="--dual-text-stroke-offset-y: 2px"
            >
              {{ deck.name }}
            </div>
            <div class="affinities">
              <img
                v-for="aff in affinities"
                :key="aff"
                :src="
                  assets[`ui/card/v3/affinity-${aff.toLocaleLowerCase()}`].path
                "
                :alt="aff"
                class="affinity"
              />
            </div>
          </header>

          <ManaCurveChart :deck-builder="deckBuilder" class="mana-curve" />

          <ul class="mb-3" v-if="violations.length > 0">
            <li v-for="(violation, index) in violations" :key="index">
              <span class="invalid-label">{{ violation.reason }}</span>
            </li>
          </ul>

          <div class="details-cards">
            <div
              v-for="card in cards"
              :key="card.blueprint.id"
              class="relative"
            >
              <BlueprintSmallCard :blueprint="card.blueprint" />
              <div class="copies">
                {{ card.copies }}
              </div>
            </div>
          </div>
          <footer>
            <FancyButton
              class="mt-4"
              text="Edit Deck"
              :to="{
                name: 'Collection',
                query: { from: route.name, deck: deck.id }
              }"
            />
          </footer>
        </div>
      </div>
    </UiDrawer>
  </div>
</template>

<style scoped lang="postcss">
.player-deck-card {
  position: relative;
  padding: var(--size-2) var(--size-4);
  width: calc(113px * 2);
  height: calc(141px * 2);
  background: url(@/assets/ui/card/v3/deck.png);
  background-size: cover;

  /* border: solid 1px hsl(var(--color-primary-hsl) / 0.5); */
  &.invalid {
    background: url(@/assets/ui/card/v3/deck-invalid.png);
    background-size: cover;
  }
}

.deck-name {
  position: absolute;
  bottom: 62px;
  left: 50%;
  transform: translateX(-50%);
  flex: 1 1 0%;
  text-align: left;
  align-self: stretch;
  font-size: var(--font-size-3);
  font-weight: var(--font-weight-7);
  @screen lt-lg {
    font-size: var(--font-size-1);
  }
}

.deck-details {
  height: 100%;
  padding-right: 0;
}

.details-scroller {
  height: 100%;
  overflow: auto;
  padding-right: var(--size-4);
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

.invalid-label {
  color: var(--red-5);
}

.affinity {
  width: 26px;
  aspect-ratio: 1 / 1;
  @screen lt-lg {
    width: 13px;
  }
}

.art {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: 105px;
  width: calc(var(--pixel-scale) * var(--width));
  height: calc(var(--pixel-scale) * var(--height));
  overflow: hidden;
  pointer-events: none;

  &.spell,
  &.rune,
  &.secret,
  &.artifact {
    translate: 0 calc(var(--pixel-scale) * -15px);
  }

  &.destiny {
    translate: 0 calc(var(--pixel-scale) * 3px);
  }
}

.sprite {
  position: absolute;
  inset: 0;
  background: v-bind(imageBg);
  background-position: var(--bg-position);
  background-repeat: no-repeat;
  background-size: var(--background-width) var(--background-height);
  pointer-events: none;
}

.affinities {
  display: flex;
  gap: var(--size-2);
  position: absolute;
  bottom: 28px;
  left: 50%;
  transform: translateX(-50%);
}

.details-toggle {
  position: absolute;
  bottom: 0px;
  right: 0px;
  width: 48px;
  aspect-ratio: 1;
  background: url('@/assets/ui/question-mark.png') no-repeat center center;
  background-size: cover;
  &:hover:not(:disabled) {
    filter: brightness(1.5);
  }
}

.deck-details {
  --pixel-scale: 3;
  header {
    padding-block: var(--size-5);
    border: solid 1px #73473a;
    z-index: 0;
    margin-bottom: var(--size-5);
    overflow-x: clip;
    background: linear-gradient(
      to right,
      transparent,
      #111 30%,
      #111 70%,
      transparent
    );

    .affinities {
      position: absolute;
      left: 50%;
      bottom: 0;
      translate: 0 50%;
    }
  }

  footer {
    position: sticky;
    bottom: 0;
    display: flex;
    justify-content: flex-end;
  }
}

.details-name {
  font-family: 'Cinzel Decorative', 'Cinzel', serif;
  font-size: var(--font-size-4);
  text-align: center;
  font-weight: var(--font-weight-7);
  line-height: 1;
}
.details-art {
  position: absolute;
  width: calc(var(--pixel-scale) * var(--width));
  height: calc(var(--pixel-scale) * var(--height));
  right: 0;
  pointer-events: none;
  scale: -1 1;
  bottom: -120px;

  &.spell &,
  &.rune &,
  &.artifact & {
    translate: 0 0;
  }
  &.minion {
    translate: 25% -20px;
  }
  &.destiny {
    translate: 25px 0px;
  }
}

.details-sprite {
  position: absolute;
  inset: 0;
  background: var(--bg);
  background-position: var(--bg-position);
  background-repeat: no-repeat;
  background-size: var(--background-width) var(--background-height);
  pointer-events: none;
}

.details-cards {
  --pixel-scale: 1;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  column-gap: var(--size-1);
  row-gap: var(--size-2);
}

.copies {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.7);
  width: 24px;
  aspect-ratio: 1;
  border-radius: var(--radius-round);
  display: grid;
  place-items: center;
  border: solid 1px #af7d48;
  color: #af7d48;
  font-weight: var(--font-weight-7);
}

.mana-curve {
  height: var(--size-11);
  margin-bottom: var(--size-3);
}
</style>
