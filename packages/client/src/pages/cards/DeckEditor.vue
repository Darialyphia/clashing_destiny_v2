<script setup lang="ts">
import { useCollectionPage } from './useCollectionPage';
import FancyButton from '@/ui/components/FancyButton.vue';
import { Icon } from '@iconify/vue';

const { deckBuilder, isEditingDeck, saveDeck } = useCollectionPage();
</script>

<template>
  <div class="deck">
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
          <div class="mana-cost">{{ card.blueprint.manaCost }}</div>
          {{ card.blueprint.name }} X {{ card.copies }}
        </li>
      </ul>
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
  gap: var(--size-3);
  align-items: center;
  border: solid var(--border-size-1) #d7ad42;
  padding: var(--size-2) var(--size-3);
  cursor: url('/assets/ui/cursor-hover.png'), auto;
  background-image: linear-gradient(
      to right,
      hsl(0deg 0% 0% / 0.5),
      hsl(0deg 0% 0% / 0.5)
    ),
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
</style>
