<script setup lang="ts">
import {
  HoverCardRoot,
  HoverCardTrigger,
  HoverCardPortal,
  HoverCardContent
} from 'reka-ui';
import BlueprintCard from '@/card/components/BlueprintCard.vue';
import { sprites } from '@/assets';
import type { CardBlueprint } from '@game/engine/src/card/card-blueprint';
import type { DeckBuilderCardMeta } from '@/card/deck-builder.model';
import { useCardTilt } from '@/card/composables/useCardtilt';
import { useCollectionPage } from './useCollectionPage';
import FoilSheen from '@/card/components/foil/FoilSheen.vue';
import FoilOil from '@/card/components/foil/FoilOil.vue';
import FoilEmboss from '@/card/components/foil/FoilEmboss.vue';
import FoilStarfield from '@/card/components/foil/FoilStarfield.vue';
import CardGlare from '@/card/components/CardGlare.vue';
import { match } from 'ts-pattern';
import { CARD_KINDS } from '@game/engine/src/card/card.enums';
import { ANIMATIONS_NAMES } from '@game/engine/src/game/game.enums';
import { useSprite } from '@/shared/composables/useSprite';

const { card } = defineProps<{
  card: {
    blueprint: CardBlueprint;
    copies: number;
    blueprintId: string;
    meta: DeckBuilderCardMeta;
  };
}>();

const { deckBuilder } = useCollectionPage();

const root = useTemplateRef('root');
const { pointerStyle, onMousemove, onMouseleave, onMouseEnter } = useCardTilt(
  root,
  {
    maxAngle: 15,
    isEnabled: ref(true)
  }
);

const animationSequence = computed(() => {
  return match(card.blueprint.kind)
    .with(CARD_KINDS.MINION, () => [ANIMATIONS_NAMES.BREATHING])
    .with(
      CARD_KINDS.SPELL,
      CARD_KINDS.ARTIFACT,
      CARD_KINDS.SECRET,
      CARD_KINDS.DESTINY,
      CARD_KINDS.RUNE,
      () => [ANIMATIONS_NAMES.DEFAULT]
    )
    .exhaustive();
});

const sprite = computed(() => {
  return sprites[`cards/${card.blueprint.art.default.sprite}`];
});

const { activeFrameRect, bgPosition, imageBg } = useSprite({
  animationSequence,
  sprite,
  kind: computed(() => card.blueprint.kind),
  scale: 1,
  scalePositionByPixelScale: true,
  animated: false
});
</script>

<template>
  <HoverCardRoot :open-delay="100" :close-delay="0">
    <HoverCardTrigger v-bind="$attrs" as-child>
      <li
        ref="root"
        :class="card.blueprint.kind.toLocaleLowerCase()"
        class="deck-item"
        @click="deckBuilder.removeCard(card.meta!.cardId)"
        @mousemove="onMousemove"
        @mouseenter="onMouseEnter"
        @mouseleave="onMouseleave"
      >
        <div
          v-if="sprite"
          class="art"
          :class="[card.blueprint.kind.toLocaleLowerCase()]"
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
  padding: var(--size-3) var(--size-3);
  cursor: url('@/assets/ui/cursor-hover.png'), auto;
  background-image: linear-gradient(to right, #2b2136 25%, transparent);
  background-repeat: no-repeat;
  background-position:
    center center,
    calc(100% + 40px) -35px;
  background-size: cover, calc(2px * 96);
  transition: transform 0.3s var(--ease-2);
  overflow: hidden;

  @starting-style {
    opacity: 0;
    transform: translateX(-3rem);
  }

  @screen lt-lg {
    padding-left: var(--size-1);
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
  flex-shrink: 0;
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
  font-weight: var(--font-weight-6);
  position: relative;
  z-index: 1;
}

.affinity {
  width: 13px;
  aspect-ratio: 1;
  background: var(--bg);
  background-size: cover;
}

.art {
  position: absolute;
  width: calc(var(--pixel-scale) * var(--width));
  height: calc(var(--pixel-scale) * var(--height));
  right: 0;
  pointer-events: none;
  translate: 0 -20px;
  scale: -1 1;
  opacity: 0.75;
  .spell &,
  .rune &,
  .artifact & {
    translate: 0 0;
  }
  .minion & {
    translate: 25% -20px;
  }
  .destiny & {
    translate: 25px 0px;
  }

  @screen lt-lg {
    opacity: 0.5;
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
</style>
