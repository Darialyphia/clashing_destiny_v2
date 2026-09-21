<script setup lang="ts">
import {
  HoverCardRoot,
  HoverCardTrigger,
  HoverCardPortal,
  HoverCardContent
} from 'reka-ui';
import BlueprintCard from '@/card/components/BlueprintCard.vue';
import { assets } from '@/assets';
import type { CardBlueprint } from '@game/engine/src/card/card-blueprint';
import type { DeckBuilderCardMeta } from '@/card/deck-builder.model';
import { useCardTilt } from '@/card/composables/useCardtilt';
import { useCollectionPage } from './useCollectionPage';
import FoilSheen from '@/card/components/foil/FoilSheen.vue';
import FoilOil from '@/card/components/foil/FoilOil.vue';
import FoilEmboss from '@/card/components/foil/FoilEmboss.vue';
import FoilStarfield from '@/card/components/foil/FoilStarfield.vue';
import CardGlare from '@/card/components/CardGlare.vue';

const { card } = defineProps<{
  card: {
    blueprint: CardBlueprint;
    copies: number;
    blueprintId: string;
    meta: DeckBuilderCardMeta;
  };
}>();

const { deckBuilder } = useCollectionPage();

const cardBg = computed(() => {
  const main = assets[`cards/${card.blueprint.art.default.main}`];
  if (main) return main.css;
  const sprite = assets[`cards/${card.blueprint.art.default.sprite}`];
  if (sprite) return sprite.css;

  return '';
});

const root = useTemplateRef('root');
const { pointerStyle, onMousemove, onMouseleave, onMouseEnter } = useCardTilt(
  root,
  {
    maxAngle: 15,
    isEnabled: ref(true)
  }
);
</script>

<template>
  <HoverCardRoot :open-delay="100" :close-delay="0">
    <HoverCardTrigger v-bind="$attrs" as-child>
      <li
        ref="root"
        :style="{
          '--bg': cardBg
        }"
        :class="card.blueprint.kind.toLocaleLowerCase()"
        class="deck-item"
        @click="deckBuilder.removeCard(card.meta!.cardId)"
        @mousemove="onMousemove"
        @mouseenter="onMouseEnter"
        @mouseleave="onMouseleave"
      >
        <template v-if="card.meta.isFoil">
          <FoilStarfield v-if="card.blueprint.art.default.foil.starField" />
          <FoilSheen v-if="card.blueprint.art.default.foil.sheen" />
          <FoilOil v-if="card.blueprint.art.default.foil.oil" />
          <FoilEmboss v-if="card.blueprint.art.default.foil.emboss" />
        </template>
        <div class="mana-cost" v-if="'manaCost' in card.blueprint">
          {{ card.blueprint.manaCost }}
        </div>
        <span class="card-name">
          <template v-if="'copies' in card">X {{ card.copies }}</template>
          {{ card.blueprint.name }}
        </span>
        <div class="flex gap-1 items-center ml-auto">
          <div
            v-for="affinity in card.blueprint.affinities"
            :key="affinity"
            class="affinity"
            :style="{
              '--bg':
                assets[`ui/card/v3/affinity-${affinity.toLocaleLowerCase()}`]
                  .css
            }"
          />
        </div>
        <CardGlare />
      </li>
    </HoverCardTrigger>
    <HoverCardPortal>
      <HoverCardContent side="left" :side-offset="10">
        <BlueprintCard
          :blueprint="card.blueprint"
          style="--pixel-scale: 2"
          :is-foil="card.meta.isFoil"
        />
      </HoverCardContent>
    </HoverCardPortal>
  </HoverCardRoot>
</template>

<style scoped lang="postcss">
.deck-item {
  --foil-animated-toggle: ;
  --glare-x: calc(1px * v-bind('pointerStyle?.glareX'));
  --glare-y: calc(1px * v-bind('pointerStyle?.glareY'));
  position: relative;
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
  background: url(@/assets/ui/card/v3/mana-cost.png) no-repeat center center;
  background-size: contain;
  font-size: var(--size-3);
  font-weight: var(--font-weight-5);
  width: 29px;
  aspect-ratio: 1;
  display: grid;
  place-content: center;
  -webkit-text-stroke: 4px black;
  paint-order: stroke fill;
  padding-right: 1px;
}

.exp-cost {
  background: url(@/assets/ui/card/exp-cost.png) no-repeat center center;
  background-size: contain;
  font-size: var(--size-3);
  font-weight: var(--font-weight-5);
  width: 24px;
  aspect-ratio: 1;
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

.affinity {
  width: 13px;
  aspect-ratio: 1;
  background: var(--bg);
  background-size: cover;
}
</style>
