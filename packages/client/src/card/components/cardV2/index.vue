<script setup lang="ts">
import type { Rune } from '@game/engine/src/player/player.enums';
import {
  type CardKind,
  type Rarity,
  type JobId,
  type Affinity,
  type CardSpeed,
  CARD_KINDS,
  getJobById
} from '@game/engine/src/card/card.enums';
import { isDefined, uppercaseFirstLetter } from '@game/shared';
import CardGlare from '../CardGlare.vue';
import { useCardTilt } from '../../composables/useCardtilt';
import FoilSheen from '../foil/FoilSheen.vue';
import FoilOil from '../foil/FoilOil.vue';
import FoilGradient from '../foil/FoilGradient.vue';
import FoilScanlines from '../foil/FoilScanlines.vue';
import FoilLightGradient from '../foil/FoilLightGradient.vue';
import FoilGoldenGlare from '../foil/FoilGoldenGlare.vue';
import FoilGlitter from '../foil/FoilGlitter.vue';
import type { CardArt } from '@game/engine/src/card/card-blueprint';
import FoilBrightShine from '../foil/FoilBrightShine.vue';
import ManaCost from './ManaCost.vue';
import Stats from './Stats.vue';
import AffinityFlags from './AffinityFlags.vue';
import CardName from './CardName.vue';
import Description from './Description.vue';
import CardArtComponent from './CardArt.vue';
import CardRarity from './Rarity.vue';
import Speed from './Speed.vue';
import { assets } from '@/assets';
import UiSimpleTooltip from '@/ui/components/UiSimpleTooltip.vue';
import RuneCost from './RuneCost.vue';

const {
  card,
  isFoil,
  isAnimated = true,
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
    runeCost?: Rune[] | null;
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
  maxTiltAngle?: number;
  isTiltEnabled?: boolean;
}>();

const root = useTemplateRef('card');

const { pointerStyle, angle, onMousemove, onMouseleave, onMouseEnter } =
  useCardTilt(root, {
    maxAngle: maxTiltAngle,
    isEnabled: computed(() => isTiltEnabled && isFoil)
  });

const tint = computed(() => {
  return `linear-gradient(to right in oklch, ${card.affinities
    .map(affinity => {
      return `var(--tint-${affinity.toLocaleLowerCase()})`;
    })
    .join(', ')})`;
});

const kindBg = computed(() => {
  return assets[`ui/card/kind-${card.kind.toLowerCase()}`].css;
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
      :class="[
        card.kind.toLocaleLowerCase(),
        isAnimated && 'animated',
        card.art.isFullArt && 'full-art'
      ]"
      :data-flip-id="`card_${card.id}`"
    >
      <div class="card-front" :style="{ '--tint': tint }">
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

        <div class="card-border" />
        <ManaCost
          v-if="isDefined(card.manaCost)"
          :cost="card.manaCost"
          :baseCost="card.baseManaCost ?? card.manaCost"
        />
        <RuneCost v-if="isDefined(card.runeCost)" :cost="card.runeCost" />
        <CardRarity :rarity="card.rarity" />
        <AffinityFlags :affinities="card.affinities" />
        <CardName :name="card.name" />

        <div class="tags">
          <UiSimpleTooltip>
            <template #trigger>
              <div class="kind" />
            </template>
            {{ uppercaseFirstLetter(card.kind.toLocaleLowerCase()) }}
          </UiSimpleTooltip>

          <div>
            <span v-if="isDefined(card.subKind)">
              - {{ uppercaseFirstLetter(card.subKind.toLocaleLowerCase()) }}
            </span>
            <span v-if="card.jobs.length" class="jobs">
              |
              {{ card.jobs.map(jobId => getJobById(jobId)?.name).join(' | ') }}
            </span>
            <span v-if="isDefined(card.tags)" class="tags">
              <template v-if="card.tags?.length">|</template>
              {{ card.tags.join('| ') }}
            </span>
          </div>
        </div>
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
        <Speed
          v-if="
            isDefined(card.speed) &&
            card.kind !== CARD_KINDS.HERO &&
            card.kind !== CARD_KINDS.DESTINY
          "
          :speed="card.speed"
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
  &.full-art {
    text-shadow: 0 0 10px black;
    background: none;
  }

  --glare-mask: url('@/assets/ui/card/v2/card-front.png');
  --foil-mask: url('@/assets/ui/card/v2/card-front.png');

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: var(--tint);
    mix-blend-mode: color-dodge;
    opacity: 0.3;
    mask-size: cover;
    z-index: -1;
    pointer-events: none;
  }
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
  background: url('@/assets/ui/card/v2/card-back.png');
  background-size: cover;
  --glare-mask: url('@/assets/ui/card/v2/card-back.png');
  --foil-mask: url('@/assets/ui/card/v2/card-back.png');
}

@property --foil-image-shadow-hue {
  syntax: '<number>';
  inherits: true;
  initial-value: 0;
}

.card-border {
  position: absolute;
  inset: 0;
  background: url('@/assets/ui/card/v2/card-front-border.png');
  background-size: cover;
  pointer-events: none;
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

.kind {
  width: calc(16px * var(--pixel-scale));
  aspect-ratio: 1;
  background: v-bind(kindBg);
  background-size: cover;
}

.tags {
  position: absolute;
  width: fit-content;
  display: flex;
  gap: calc(2px * var(--pixel-scale));
  font-size: calc(var(--pixel-scale) * 11px);
  top: calc(194px * var(--pixel-scale));
  left: 50%;
  translate: -50% 0;
  color: #e9d8c0;
  text-shadow: 0 0 0.75rem black;
  -webkit-text-stroke: 2px black;
  paint-order: stroke fill;
}
</style>
