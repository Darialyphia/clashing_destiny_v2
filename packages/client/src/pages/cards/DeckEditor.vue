<script setup lang="ts">
import { useCollectionPage } from './useCollectionPage';
import FancyButton from '@/ui/components/FancyButton.vue';
import { CARD_KINDS, type CardKind } from '@game/engine/src/card/card.enums';

const { deckBuilder, isEditingDeck, saveDeck } = useCollectionPage();

const getCountByKind = (kind: CardKind) => {
  return deckBuilder.value.cards
    .filter(c => c.blueprint.kind === kind)
    .reduce((acc, card) => {
      if ('copies' in card) {
        return acc + ((card.copies as number) ?? 1);
      }
      return acc + 1;
    }, 0);
};

const getCount = (cards: Array<{ copies: number }>) => {
  return cards.reduce((acc, card) => {
    if ('copies' in card) {
      return acc + ((card.copies as number) ?? 1);
    }
    return acc + 1;
  }, 0);
};

const getCountForCost = (cost: number) =>
  getCount(
    deckBuilder.value.mainDeckCards.filter(c => c.blueprint.manaCost === cost)
  );

const getCountForCostAndUp = (minCost: number) =>
  getCount(
    deckBuilder.value.mainDeckCards.filter(c => c.blueprint.manaCost >= minCost)
  );
</script>

<template>
  <div class="deck">
    <div>
      <div class="flex gap-2 items-center">
        <img class="edit-icon" src="/assets/ui/pen.png" />
        <input
          v-model="deckBuilder.deck.name"
          type="text"
          class="flex-1 bg-transparent deck-name"
        />
      </div>
      <div class="bars" :style="{ '--total': deckBuilder.mainDeckSize }">
        <div
          v-for="i in 7"
          :key="i"
          :style="{
            '--count':
              i === 7 ? getCountForCostAndUp(i - 1) : getCountForCost(i - 1)
          }"
        >
          <div class="bar" :data-count="getCountForCost(i - 1)" />
          <div class="cost">{{ i === 7 ? '6+' : i - 1 }}</div>
        </div>
      </div>
      <div class="counts">
        <div>
          <span>{{ getCountByKind(CARD_KINDS.MINION) }}</span>
          Minions
        </div>
        <div>
          <span>{{ getCountByKind(CARD_KINDS.SPELL) }}</span>
          Spells
        </div>
        <div>
          <span>{{ getCountByKind(CARD_KINDS.ARTIFACT) }}</span>
          Artifacts
        </div>
      </div>
    </div>
    <div class="overflow-y-auto fancy-scrollbar">
      <ul>
        <li
          v-if="deckBuilder.hero"
          :style="{
            '--bg': `url(/assets/icons/${deckBuilder.hero.blueprint.cardIconId}.png)`
          }"
          class="deck-item"
          @click="deckBuilder.removeCard(deckBuilder.hero.blueprint.id)"
        >
          {{ deckBuilder.hero.blueprint.name }}
        </li>
        <li
          v-for="(card, index) in deckBuilder.cards"
          :key="index"
          :style="{
            '--bg': `url(/assets/icons/${card.blueprint.cardIconId}.png)`
          }"
          :class="card.blueprint.kind.toLocaleLowerCase()"
          class="deck-item"
          @click="deckBuilder.removeCard(card.blueprintId)"
        >
          <div class="mana-cost" v-if="'manaCost' in card.blueprint">
            {{ card.blueprint.manaCost }}
          </div>
          <div class="destiny-cost" v-if="'destinyCost' in card.blueprint">
            {{ card.blueprint.destinyCost }}
          </div>
          <span class="card-name">
            <template v-if="'copies' in card">X {{ card.copies }}</template>
            {{ card.blueprint.name }}
          </span>
        </li>
      </ul>
      <div class="deck-count">
        Main deck ({{ deckBuilder.mainDeckSize }} /
        {{ deckBuilder.validator.mainDeckSize }})
      </div>
    </div>
    <div class="flex gap-2 mt-3">
      <FancyButton text="Back" variant="error" @click="isEditingDeck = false" />
      <FancyButton text="Save" variant="info" @click="saveDeck" />
    </div>
  </div>
</template>

<style scoped lang="postcss">
.deck {
  display: grid;
  grid-template-rows: auto 1fr auto;
  height: 100%;
}

.deck-item {
  display: flex;
  gap: var(--size-2);
  align-items: center;
  border: solid var(--border-size-1) #d7ad42;
  padding: var(--size-2) var(--size-3);
  cursor: url('/assets/ui/cursor-hover.png'), auto;
  background-image:
    linear-gradient(to right, hsl(0deg 0% 0% / 0.5), hsl(0deg 0% 0% / 0.5)),
    var(--bg);
  background-repeat: no-repeat;
  background-position:
    center center,
    calc(100% + 40px) -75px;
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
    background-image:
      linear-gradient(hsl(0deg 0% 0% / 0.25), hsl(0deg 0% 0% / 0.25)), var(--bg);
    background-size: 200%, calc(2.25 * 96px);
    background-position:
      center center,
      calc(100% + 50px) -85px;
  }

  @starting-style {
    opacity: 0;
    transform: translateX(-3rem);
  }
}

.mana-cost {
  background: url(/assets/ui/card-mana.png) no-repeat center center;
  background-size: contain;
  font-size: var(--size-3);
  font-weight: var(--font-weight-5);
  width: 28px;
  height: 30px;
  display: grid;
  place-content: center;
  -webkit-text-stroke: 4px black;
  paint-order: stroke fill;
  padding-right: 1px;
}

.destiny-cost {
  background: url(/assets/ui/card-destiny.png) no-repeat center center;
  background-size: contain;
  font-size: var(--size-3);
  font-weight: var(--font-weight-5);
  width: 28px;
  height: 30px;
  display: grid;
  place-content: center;
  -webkit-text-stroke: 4px black;
  paint-order: stroke fill;
  padding-right: 1px;
}

.counts {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--size-2);
  justify-items: center;
  font-size: var(--font-size-00);
  margin-block: var(--size-1) var(--size-3);
  > div > span {
    font-size: var(--font-size-2);
    color: var(--primary);
    font-weight: var(--font-weight-5);
  }
}

.deck-count {
  font-size: var(--font-size-3);
  line-height: 1;
  font-weight: 500;
  text-align: right;
  position: sticky;
  bottom: 0;
  background-color: #261a26;
  padding: var(--size-3) var(--size-3) 0;
  box-shadow: 0 -10px 1rem hsl(var(--gray-12-hsl) / 0.5);
}

.bars {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: var(--size-1);
  height: var(--size-10);
  margin-top: var(--size-2);

  > div {
    display: grid;
    grid-template-rows: 1fr auto;
    gap: var(--size-1);
  }
}

.cost {
  display: grid;
  place-content: center;
  color: var(--primary);
}

.bar {
  --percent: calc(1% * (var(--count) * 100 / var(--total)));

  position: relative;
  background: linear-gradient(
    to top,
    var(--primary) 0%,
    var(--primary) var(--percent),
    hsl(var(--gray-12-hsl) / 0.5) var(--percent)
  );

  &:not([data-count='0'])::after {
    content: attr(data-count);

    position: absolute;
    bottom: var(--percent);
    left: 50%;
    transform: translateX(-50%);

    font-size: var(--font-size-0);
  }
}

.affinity {
  background: var(--bg);
  background-size: cover;
  background-position: center;
  width: calc(1 * 26px);
  height: calc(1 * 28px);
}

.card-name {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

.deck-name {
  border-image-slice: 16 fill;
  border-image-width: 16px;
  color: black;
  padding: var(--size-2);
  border-image-source: url('/assets/ui/text-input.png');
}

.edit-icon {
  width: 24px;
  height: 24px;
}
</style>
