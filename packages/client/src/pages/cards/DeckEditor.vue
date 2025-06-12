<script setup lang="ts">
import { useCollectionPage } from './useCollectionPage';

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
      <FancyButton text="Back" variant="error" @click="isEditingDeck = false" />
      <FancyButton text="Save" @click="saveDeck" />
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
</style>
