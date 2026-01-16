<script setup lang="ts">
import {
  HoverCardRoot,
  HoverCardTrigger,
  HoverCardPortal,
  HoverCardContent,
  TabsRoot,
  TabsList,
  TabsTrigger,
  TabsContent
} from 'reka-ui';
import BlueprintCard from '@/card/components/BlueprintCard.vue';
import { useCollectionPage } from './useCollectionPage';
import { assets } from '@/assets';

const { deckBuilder } = useCollectionPage();
</script>

<template>
  <TabsRoot as-child default-value="main">
    <div class="deck-cards">
      <TabsList as-child>
        <header>
          <TabsTrigger value="main">
            Main ({{ deckBuilder.mainDeckSize }})
          </TabsTrigger>
          <TabsTrigger value="destiny">
            Destiny ({{ deckBuilder.destinyDeckSize }})
          </TabsTrigger>
        </header>
      </TabsList>
      <TabsContent as-child value="main">
        <ul class="overflow-y-auto fancy-scrollbar">
          <HoverCardRoot
            :open-delay="100"
            :close-delay="0"
            v-for="(card, index) in deckBuilder.mainDeckCards"
            :key="index"
          >
            <HoverCardTrigger class="inspectable-card" v-bind="$attrs" as-child>
              <li
                :style="{
                  '--bg': assets[`cards/${card.blueprint.art.default.main}`].css
                }"
                :class="card.blueprint.kind.toLocaleLowerCase()"
                class="deck-item"
                @click="deckBuilder.removeCard(card.meta!.cardId)"
              >
                <div class="mana-cost" v-if="'manaCost' in card.blueprint">
                  {{ card.blueprint.manaCost }}
                </div>
                <div
                  class="destiny-cost"
                  v-if="'destinyCost' in card.blueprint"
                >
                  {{ card.blueprint.destinyCost }}
                </div>
                <span class="card-name">
                  <template v-if="'copies' in card">
                    X {{ card.copies }}
                  </template>
                  {{ card.blueprint.name }}
                </span>
              </li>
            </HoverCardTrigger>
            <HoverCardPortal>
              <HoverCardContent side="left" :side-offset="10">
                <BlueprintCard :blueprint="card.blueprint" />
              </HoverCardContent>
            </HoverCardPortal>
          </HoverCardRoot>
        </ul>
      </TabsContent>
      <TabsContent as-child value="destiny">
        <ul class="overflow-y-auto fancy-scrollbar">
          <HoverCardRoot
            :open-delay="100"
            :close-delay="0"
            v-for="(card, index) in deckBuilder.destinyDeckCards"
            :key="index"
          >
            <HoverCardTrigger class="inspectable-card" v-bind="$attrs" as-child>
              <li
                :style="{
                  '--bg': assets[`cards/${card.blueprint.art.default.main}`].css
                }"
                :class="card.blueprint.kind.toLocaleLowerCase()"
                class="deck-item"
                @click="deckBuilder.removeCard(card.meta!.cardId)"
              >
                <div class="mana-cost" v-if="'manaCost' in card.blueprint">
                  {{ card.blueprint.manaCost }}
                </div>
                <div
                  class="destiny-cost"
                  v-if="'destinyCost' in card.blueprint"
                >
                  {{ card.blueprint.destinyCost }}
                </div>
                <span class="card-name">
                  <template v-if="'copies' in card">
                    X {{ card.copies }}
                  </template>
                  {{ card.blueprint.name }}
                </span>
              </li>
            </HoverCardTrigger>
            <HoverCardPortal>
              <HoverCardContent side="left" :side-offset="10">
                <BlueprintCard :blueprint="card.blueprint" />
              </HoverCardContent>
            </HoverCardPortal>
          </HoverCardRoot>
        </ul>
      </TabsContent>
    </div>
  </TabsRoot>
</template>

<style scoped lang="postcss">
.deck-cards {
  overflow-y: hidden;
  display: flex;
  flex-direction: column;
  display: grid;
  grid-template-rows: auto 1fr;
}
.deck-item {
  display: flex;
  gap: var(--size-2);
  align-items: center;
  border: solid var(--border-size-1) #d7ad42;
  padding: var(--size-2) var(--size-3);
  cursor: url('@/assets/ui/cursor-hover.png'), auto;
  background-image:
    linear-gradient(to right, #0c0c0c 25%, transparent), var(--bg);
  background-repeat: no-repeat;
  background-position:
    center center,
    calc(100% + 40px) -35px;
  background-size: cover, calc(2px * 96);
  transition: transform 0.3s var(--ease-2);

  @starting-style {
    opacity: 0;
    transform: translateX(-3rem);
  }
}

.mana-cost {
  background: url(@/assets/ui/mana-cost.png) no-repeat center center;
  background-size: contain;
  font-size: var(--size-3);
  font-weight: var(--font-weight-5);
  width: calc(22px * var(--pixel-scale));
  height: calc(20px * var(--pixel-scale));
  display: grid;
  place-content: center;
  -webkit-text-stroke: 4px black;
  paint-order: stroke fill;
  padding-right: 1px;
}

.destiny-cost {
  background: url(@/assets/ui/destiny-cost.png) no-repeat center center;
  background-size: contain;
  font-size: var(--size-3);
  font-weight: var(--font-weight-5);
  width: calc(22px * var(--pixel-scale));
  height: calc(20px * var(--pixel-scale));
  display: grid;
  place-content: center;
  -webkit-text-stroke: 4px black;
  paint-order: stroke fill;
  padding-right: 1px;
}

.card-name {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  -webkit-text-stroke: 4px black;
  paint-order: stroke fill;
}
</style>
