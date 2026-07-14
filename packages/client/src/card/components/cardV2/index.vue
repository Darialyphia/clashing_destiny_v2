<script setup lang="ts">
import {
  RARITIES,
  type CardKind,
  type Rarity,
  type JobId,
  type Affinity,
  type CardSpeed
} from '@game/engine/src/card/card.enums';
import { isDefined, uppercaseFirstLetter } from '@game/shared';
import CardText from '@/card/components/CardText.vue';
import { until, useResizeObserver } from '@vueuse/core';
import CardGlare from '../CardGlare.vue';
import { useCardTilt } from '../../composables/useCardtilt';
import FoilSheen from '../foil/FoilSheen.vue';
import FoilOil from '../foil/FoilOil.vue';
import FoilGradient from '../foil/FoilGradient.vue';
import FoilScanlines from '../foil/FoilScanlines.vue';
import FoilLightGradient from '../foil/FoilLightGradient.vue';
import FoilGoldenGlare from '../foil/FoilGoldenGlare.vue';
import FoilGlitter from '../foil/FoilGlitter.vue';
import { assets } from '@/assets';
import type { CardArt } from '@game/engine/src/card/card-blueprint';
import FoilBrightShine from '../foil/FoilBrightShine.vue';
import { getJobById } from '@game/engine/src/card/card.enums';
import ManaCost from './ManaCost.vue';
import Stats from './Stats.vue';
import AffinityFlags from './AffinityFlags.vue';
import CardName from './CardName.vue';
import Description from './Description.vue';
import CardArtComponent from './CardArt.vue';

const {
  card,
  isFoil,
  isAnimated = true,
  showText = true,
  maxTiltAngle = 30,
  isTiltEnabled = true
} = defineProps<{
  card: {
    id: string;
    name: string;
    description: string;
    art: CardArt;
    kind: CardKind;
    manaCost?: number | null;
    baseManaCost?: number | null;
    rarity: Rarity;
    atk?: number | null;
    hp?: number | null;
    durability?: number | null;
    abilities?: string[];
    subKind?: string | null;
    tags?: string[];
    jobs: JobId[];
    affinities: Affinity[];
    speed?: CardSpeed;
    commandment?: number | null;
  };
  isFoil?: boolean;
  isAnimated?: boolean;
  showText?: boolean;
  maxTiltAngle?: number;
  isTiltEnabled?: boolean;
}>();

const rarityBg = computed(() => {
  if (
    [RARITIES.BASIC, RARITIES.COMMON, RARITIES.TOKEN].includes(
      card.rarity as any
    )
  ) {
    return assets[`ui/card/rarity-common`].css;
  }

  return assets[`ui/card/rarity-${card.rarity}`].css;
});

const artBgImage = computed(() => {
  return assets[card.art.bg].css;
});

const artMainImage = computed(() => {
  return assets[card.art.main].css;
});

const artFoilImage = computed(() => {
  if (!card.art.foilMain) return 'transparent';
  return assets[card.art.foilMain].css;
});

const root = useTemplateRef('card');

const { pointerStyle, angle, onMousemove, onMouseleave, onMouseEnter } =
  useCardTilt(root, {
    maxAngle: maxTiltAngle,
    isEnabled: computed(() => isTiltEnabled && isFoil)
  });
</script>

<template>
  <div
    class="card-perspective-wrapper card-v2"
    @mousemove="onMousemove"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseleave"
  >
    <div
      ref="card"
      class="card"
      :class="[card.kind.toLocaleLowerCase(), isAnimated && 'animated']"
      :data-flip-id="`card_${card.id}`"
    >
      <div class="card-front">
        <CardArtComponent :art="card.art" />
        <template v-if="isFoil">
          <FoilSheen v-if="card.art.foil.sheen" />
          <FoilOil v-if="card.art.foil.oil" />
          <FoilGradient v-if="card.art.foil.gradient" />
          <FoilLightGradient v-if="card.art.foil.lightGradient" />
          <FoilGoldenGlare v-if="card.art.foil.goldenGlare" />
          <FoilGlitter v-if="card.art.foil.glitter" />
          <FoilBrightShine v-if="card.art.foil.brightShine" />
          <FoilScanlines v-if="card.art.foil.scanlines" />
        </template>

        <ManaCost
          v-if="isDefined(card.manaCost)"
          :cost="card.manaCost"
          :baseCost="card.baseManaCost ?? card.manaCost"
        />

        <AffinityFlags :affinities="card.affinities" />
        <CardName :name="card.name" />
        <Description
          :description="card.description"
          :abilities="card.abilities ?? []"
        />
        <Stats
          :atk="card.atk ?? null"
          :hp="card.hp ?? null"
          :durability="card.durability ?? null"
          :commandment="card.commandment ?? null"
        />
        <CardGlare />
      </div>
      <div class="card-back">
        <CardGlare />
      </div>
    </div>
  </div>
</template>

<style scoped lang="postcss">
@property --foil-x {
  syntax: '<percentage>';
  inherits: true;
  initial-value: 0%;
}
@property --foil-y {
  syntax: '<percentage>';
  inherits: true;
  initial-value: 0%;
}

.card-perspective-wrapper {
  position: relative;
  transform-style: preserve-3d;
  align-self: start;
  transition: filter 0.3s;
}

.card {
  --glare-x: calc(1px * v-bind('pointerStyle?.glareX'));
  --glare-y: calc(1px * v-bind('pointerStyle?.glareY'));

  --foil-oil-x: calc(1px * v-bind('pointerStyle?.foilOilX'));
  --foil-oil-y: calc(1px * v-bind('pointerStyle?.foilOilY'));
  /* --pointer-from-center: calc(1% * v-bind('pointerStyle?.pointerFromCenter')); */
  width: calc(var(--card-v2-width) * var(--pixel-scale));
  height: calc(var(--card-v2-height) * var(--pixel-scale));
  display: grid;
  font-family: 'Lato', sans-serif;
  transform-style: preserve-3d;
  position: relative;

  --foil-animated-toggle: ;
  .card-perspective-wrapper:hover:has(.foil) &.animated {
    --foil-x: calc(1% * v-bind('pointerStyle?.foilX'));
    --foil-y: calc(1% * v-bind('pointerStyle?.foilY'));
    --foil-animated-toggle: initial;

    transform: rotateY(calc(1deg * v-bind('angle.y')))
      rotateX(calc(1deg * v-bind('angle.x')));
  }

  .card-perspective-wrapper:not(:hover):has(.foil) &.animated {
    transition: transform 0.5s;
  }

  > * {
    grid-column: 1;
    grid-row: 1;
  }
}

.card-front {
  backface-visibility: hidden;
  background: url('@/assets/ui/card/v2/card-front.png');
  background-size: cover;
  color: #fcfcfc;
  font-size: calc(var(--pixel-scale) * 8px);
  padding: 1rem;
  position: relative;
  transform-style: preserve-3d;
  position: relative;

  --glare-mask: url('@/assets/ui/card/v2/card-front.png');
  --foil-mask: url('@/assets/ui/card/v2/card-front.png');
}

.card.animated:has(.foil):deep(.parallax) {
  --parallax-strength: 0.7;
  --_parallax-strength-x: calc(
    var(--parallax-strength-x, var(--parallax-strength)) * var(--pixel-scale) /
      2
  );
  --_parallax-strength-y: calc(
    var(--parallax-strength-y, var(--parallax-strength)) * var(--pixel-scale) /
      2
  );
  --parallax-x: calc(v-bind('angle.y') * var(--_parallax-strength-x) * 1px);
  --parallax-y: calc(v-bind('angle.x') * var(--_parallax-strength-y) * -1px);
  --_parallax-offset-x: var(--parallax-offset-x, 0px);
  --_parallax-offset-y: var(--parallax-offset-y, 0px);
  translate: calc(var(--_parallax-offset-x) + var(--parallax-x))
    calc(var(--parallax-y) + var(--_parallax-offset-y));
}

.card-back {
  transform: rotateY(0.5turn);
  backface-visibility: hidden;
  background: url('@/assets/ui/card/card_backs/default.png');
  background-size: cover;
  --glare-mask: url('@/assets/ui/card-back.png');
  --foil-mask: url('@/assets/ui/card-back.png');
}

@property --foil-image-shadow-hue {
  syntax: '<number>';
  inherits: true;
  initial-value: 0;
}

.art-main {
  position: absolute;
  inset: 0;
  background: v-bind(artMainImage);
  background-size: cover;
  overflow: hidden;
  --parallax-offset-x: -50%;
  .card:has(.foil) & {
    transform: translateX(50%);
  }
}
.art-foil {
  position: absolute;
  bottom: 0;
  left: 50%;
  /* width: calc(1px * v-bind('card.art.dimensions.width') * var(--pixel-scale));
  height: calc(1px * v-bind('card.art.dimensions.height') * var(--pixel-scale)); */
  translate: -50% 0;
  background: v-bind(artFoilImage);
  background-size: cover;
  --parallax-offset-x: -50%;
}

.art-bg {
  position: absolute;
  inset: 0;
  background: v-bind(artBgImage);
  background-size: cover;
  --parallax-offset-x: -50%;
  .card:has(.foil) & {
    transform: translateX(50%);
  }
}

.image {
  pointer-events: none;
  width: calc(var(--card-art-frame-width) * var(--pixel-scale));
  height: calc(var(--card-art-frame-height) * var(--pixel-scale));
  position: absolute;
  top: calc(23px * var(--pixel-scale));
  left: 50%;
  translate: -50% 0;
  overflow: hidden;
  mask-image: url(@/assets/ui/card/masks/frame-overflow-mask.png);
  mask-size: cover;
  .foil {
    --foil-mask: v-bind(artBgImage);
    position: absolute;
    inset: 0;

    /* width: calc(1px * v-bind('card.art.dimensions.width') * var(--pixel-scale));
    height: calc(
      1px * v-bind('card.art.dimensions.height') * var(--pixel-scale)
    ); */
    /* translate: -50% 0;
    --parallax-offset-x: -50%; */
  }
}

.rarity {
  background: v-bind(rarityBg);
  background-size: cover;
  background-position: center;
  width: calc(14px * var(--pixel-scale));
  height: calc(18px * var(--pixel-scale));
  position: absolute;
  bottom: calc(87px * var(--pixel-scale));
  top: calc(132px * var(--pixel-scale));
  left: 50%;
  transform: translateX(-50%);
}

.description-frame {
  width: calc(158px * var(--pixel-scale));
  height: calc(88px * var(--pixel-scale));
  position: absolute;
  bottom: calc(6px * var(--pixel-scale));
  left: 50%;
  translate: -50% 0;
  background: url('@/assets/ui/card/description-frame.png');
  background-size: cover;
}

.speed {
  position: absolute;
  width: calc(40px * var(--pixel-scale));
  height: calc(16px * var(--pixel-scale));
  background: var(--bg);
  background-size: cover;
  right: calc(-2px * var(--pixel-scale));
  top: calc(72px * var(--pixel-scale));
  font-weight: var(--font-weight-7);
  font-family: 'Lato', sans-serif;
  --dual-text-offset-y: calc(2px * var(--pixel-scale));
  --dual-text-offset-x: calc(6px * var(--pixel-scale));

  .hero &,
  .destiny & {
    display: none;
  }
}

.text-separator {
  margin-top: calc(3px * var(--pixel-scale));
  display: flex;
  gap: var(--size-2);
  align-items: center;
  color: black;
  font-size: calc(var(--pixel-scale) * 4.5px);
  text-transform: uppercase;
  font-weight: var(--font-weight-7);
  font-family: 'Lato', sans-serif;
  opacity: 0.5;
  &::before,
  &::after {
    content: '';
    display: block;
    width: 100%;
    height: calc(0.5px * var(--pixel-scale));
    background: black;
    flex: 1;
    opacity: 0.5;
  }
}
</style>
