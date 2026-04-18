<script setup lang="ts">
import { isDefined } from '@game/shared';
import { type CardKind } from '@game/engine/src/card/card.enums';
import CardGlare from './CardGlare.vue';
import { useCardTilt } from '../composables/useCardtilt';
import FoilScanlines from './foil/FoilScanlines.vue';
import FoilSheen from './foil/FoilSheen.vue';
import FoilOil from './foil/FoilOil.vue';
import FoilGradient from './foil/FoilGradient.vue';
import FoilLightGradient from './foil/FoilLightGradient.vue';
import FoilGoldenGlare from './foil/FoilGoldenGlare.vue';
import FoilBrightShine from './foil/FoilBrightShine.vue';
import FoilGlitter from './foil/FoilGlitter.vue';
import { assets } from '@/assets';
import type { CardArt } from '@game/engine/src/card/card-blueprint';

const {
  card,
  isFoil,
  showStats = false
} = defineProps<{
  card: {
    id: string;
    art: CardArt;
    kind: CardKind;
    atk?: number | null;
    baseAtk?: number | null;
    hp?: number | null;
    countdown?: number | null;
    maxHp?: number | null;
    baseMaxHp?: number | null;
    retaliation?: number | null;
    baseRetaliation?: number | null;
    durability?: number | null;
    manaCost?: number | null;
    destinyCost?: number | null;
  };
  isFoil?: boolean;
  showStats?: boolean;
}>();

const root = useTemplateRef('card');
const { pointerStyle } = useCardTilt(root, {
  maxAngle: 10,
  isEnabled: ref(true)
});

const artBgImage = computed(() => {
  return assets[card.art.bg].css;
});

const artMainImage = computed(() => {
  return assets[card.art.main].css;
});
</script>

<template>
  <div
    class="small-card"
    :class="card.kind.toLocaleLowerCase()"
    :data-flip-id="`card_${card.id}`"
    ref="card"
  >
    <div class="card-front">
      <div class="image">
        <div class="art-bg" />
        <FoilScanlines v-if="isFoil && card.art.foil.scanlines" />
        <FoilGlitter v-if="isFoil && card.art.foil.glitter" />
        <div class="art-main" />
        <FoilBrightShine v-if="isFoil && card.art.foil.brightShine" />
        <div class="art-frame" />
      </div>

      <template v-if="showStats">
        <div
          v-if="isDefined(card.atk)"
          class="stat atk"
          :class="{
            buffed: isDefined(card.baseAtk) && card.atk > card.baseAtk,
            debuffed: isDefined(card.baseAtk) && card.atk < card.baseAtk
          }"
        >
          <div class="dual-text" :data-text="card.atk">
            {{ card.atk }}
          </div>
        </div>

        <div
          v-if="isDefined(card.retaliation)"
          class="stat retaliation"
          :class="{
            buffed:
              isDefined(card.baseRetaliation) &&
              card.retaliation > card.baseRetaliation,
            debuffed:
              isDefined(card.baseRetaliation) &&
              card.retaliation < card.baseRetaliation
          }"
        >
          <div class="dual-text" :data-text="card.retaliation">
            {{ card.retaliation }}
          </div>
        </div>

        <div
          v-if="isDefined(card.hp)"
          class="stat hp"
          :class="{
            buffed: isDefined(card.baseMaxHp) && card.hp > card.baseMaxHp,
            debuffed: isDefined(card.maxHp) && card.hp < card.maxHp
          }"
        >
          <div class="dual-text" :data-text="card.hp">
            {{ card.hp }}
          </div>
        </div>

        <div
          v-if="isDefined(card.durability) && showStats"
          class="stat durability"
        >
          <div class="dual-text" :data-text="card.durability">
            {{ card.durability }}
          </div>
        </div>
        <div
          v-if="isDefined(card.countdown) && showStats"
          class="stat countdown"
        >
          <div class="dual-text" :data-text="card.countdown">
            {{ card.countdown }}
          </div>
        </div>
      </template>
      <template v-if="isFoil">
        <FoilSheen v-if="card.art.foil.sheen" />
        <FoilOil v-if="card.art.foil.oil" />
        <FoilGradient v-if="card.art.foil.gradient" />
        <FoilLightGradient v-if="card.art.foil.lightGradient" />
        <FoilGoldenGlare v-if="card.art.foil.goldenGlare" />
      </template>
      <CardGlare />
    </div>
    <div class="card-back">
      <CardGlare />
    </div>
  </div>
</template>

<style scoped lang="postcss">
.small-card {
  --glare-x: calc(1px * v-bind('pointerStyle?.glareX'));
  --glare-y: calc(1px * v-bind('pointerStyle?.glareY'));
  --foil-oil-x: calc(1px * v-bind('pointerStyle?.foilOilX'));
  --foil-oil-y: calc(1px * v-bind('pointerStyle?.foilOilY'));
  --foil-animated-toggle: ;
  width: calc(var(--card-small-width) * var(--pixel-scale));
  height: calc(var(--card-small-height) * var(--pixel-scale));
  display: grid;
  font-family: 'Lato', sans-serif;
  transform-style: preserve-3d;
  --art-pixel-scale: calc(2 * var(--pixel-scale));
  --root-pixel-scale: var(--pixel-scale);
  &:hover {
    --foil-x: calc(1% * v-bind('pointerStyle?.foilX'));
    --foil-y: calc(1% * v-bind('pointerStyle?.foilY'));
    --foil-animated-toggle: initial;
  }
  > * {
    grid-column: 1;
    grid-row: 1;
  }
}

.card-front {
  backface-visibility: hidden;
  background-size: cover;
  color: #fcffcb;
  font-size: 16px;
  position: relative;
  transform-style: preserve-3d;
  --glare-mask: url('@/assets/ui/card/masks/frame-overflow-mask.png');
  --foil-mask: url('@/assets/ui/card/masks/frame-overflow-mask.png');
}

.card-back {
  transform: rotateY(0.5turn);
  backface-visibility: hidden;
  background: url('@/assets/ui/card/card_backs/default-small.png');
  background-size: cover;
  --glare-mask: url('@/assets/ui/card/card_backs/default-small.png');
}

.image {
  position: absolute;
  display: grid;
  transform-origin: center center;
  width: calc(var(--card-art-frame-width) * var(--pixel-scale));
  height: calc(var(--card-art-frame-height) * var(--pixel-scale));
  left: 50%;
  top: 50%;
  translate: -50% -50%;
}

.art-frame {
  position: absolute;
  inset: 0;
  background: url('@/assets/ui/card/frames/default.png');
  background-size: cover;
}
.art-main {
  position: absolute;
  inset: 0;
  background: v-bind(artMainImage);
  background-size: cover;
}

.art-bg {
  position: absolute;
  inset: 0;
  background: v-bind(artBgImage);
  background-size: cover;
}

.stat {
  width: calc(27px * var(--pixel-scale));
  height: calc(25px * var(--pixel-scale));
  background-repeat: no-repeat;
  background-size: cover;
  position: absolute;
  bottom: calc(0px * var(--pixel-scale));
  font-size: calc(var(--pixel-scale) * 11px);
  text-align: right;
  font-weight: var(--font-weight-7);
  font-family: 'Lato', sans-serif;
  display: grid;
  place-content: center;
  padding-right: 2px;
  scale: 1.5;
  &.buffed {
    --top-color: var(--green-2);
    --bottom-color: var(--green-6);
  }
  &.debuffed {
    --top-color: var(--red-5);
    --bottom-color: var(--red-9);
  }
}

.atk {
  background-image: url('@/assets/ui/card/attack.png');
  left: 0;
}

.retaliation {
  background-image: url('@/assets/ui/card/retaliation.png');
  left: 50%;
  translate: -25% 0;
}

.hp {
  background-image: url('@/assets/ui/card/health-left.png');
  right: 0;
  padding-right: 0;
  padding-left: 2px;
}

.durability {
  background-image: url('@/assets/ui/card/durability.png');
  right: 0;
  padding-right: 0px;
  padding-left: 2px;
}

.countdown {
  background-image: url('@/assets/ui/card/countdown.png');
  right: 0;
}

.mana-cost {
  background-image: url('@/assets/ui/mana-cost.png');
  background-repeat: no-repeat;
  background-size: cover;
  width: calc(22px * var(--pixel-scale));
  height: calc(20px * var(--pixel-scale));
  position: absolute;
  top: calc(2px * var(--pixel-scale));
  left: calc(12px * var(--pixel-scale));
  display: grid;
  place-content: center;
  padding-right: calc(0px * var(--pixel-scale));
  padding-top: calc(0px * var(--pixel-scale));
  font-weight: var(--font-weight-7);
  font-size: 10px;
  --dual-text-offset-y: 1px;
  scale: 2;
}
</style>
