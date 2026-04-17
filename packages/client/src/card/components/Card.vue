<script setup lang="ts">
import {
  RARITIES,
  type CardKind,
  type Rarity,
  type JobId
} from '@game/engine/src/card/card.enums';
import { isDefined, uppercaseFirstLetter } from '@game/shared';
import CardText from '@/card/components/CardText.vue';
import { until, useResizeObserver } from '@vueuse/core';
import CardGlare from './CardGlare.vue';
import { useCardTilt } from '../composables/useCardtilt';
import FoilSheen from './foil/FoilSheen.vue';
import FoilOil from './foil/FoilOil.vue';
import FoilGradient from './foil/FoilGradient.vue';
import FoilScanlines from './foil/FoilScanlines.vue';
import FoilLightGradient from './foil/FoilLightGradient.vue';
import FoilGoldenGlare from './foil/FoilGoldenGlare.vue';
import FoilGlitter from './foil/FoilGlitter.vue';
import { assets } from '@/assets';
import type { CardArt } from '@game/engine/src/card/card-blueprint';
import { getJobById } from '@game/engine/src/card/card.enums';
import FoilBrightShine from './foil/FoilBrightShine.vue';

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
    destinyCost?: number | null;
    baseDestinyCost?: number | null;
    rarity: Rarity;
    atk?: number | null;
    retaliation?: number | null;
    hp?: number | null;
    countdown?: number | null;
    durability?: number | null;
    abilities?: string[];
    subKind?: string | null;
    tags?: string[];
    jobs: JobId[];
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

const getPixelScale = () => {
  let el: HTMLElement | null = root.value;
  if (!el) return 1;
  let scale = getComputedStyle(el).getPropertyValue('--pixel-scale');
  while (!scale) {
    if (!el!.parentElement) return 1;
    el = el!.parentElement;
    scale = getComputedStyle(el).getPropertyValue('--pixel-scale');
  }

  return parseFloat(scale) || 1;
};

const setVariableFontSize = (
  box: HTMLElement,
  sizeRef: Ref<number>,
  min: number,
  max: number
) => {
  const inner = box.firstChild as HTMLElement;
  const outerHeight = box.clientHeight;
  if (inner.clientHeight <= outerHeight) {
    return;
  }
  let size = max;
  const step = 0.5;
  const scale = getPixelScale() / 2; // text size uses half pixel scale in calculation

  while (inner.clientHeight > outerHeight) {
    size -= step;
    box.style.fontSize = `${size * scale}px`;
  }
  box.style.fontSize = '';
  sizeRef.value = size;
};
const descriptionBox = useTemplateRef('description-box');
const descriptionInner = useTemplateRef('description-inner');

const resizeDescription = () => {
  if (!descriptionBox.value) return;
  setVariableFontSize(
    descriptionBox.value,
    descriptionFontSize,
    DESCRIPTION_MIN_TEXT_SIZE,
    DESCRIPTION_MAX_TEXT_SIZE
  );
};

useResizeObserver(descriptionInner, resizeDescription);

const DESCRIPTION_MIN_TEXT_SIZE = 9;
const DESCRIPTION_MAX_TEXT_SIZE = 15;
const descriptionFontSize = ref(DESCRIPTION_MAX_TEXT_SIZE);
until(descriptionBox)
  .toBeTruthy()
  .then(() => {
    resizeDescription();
  });

const nameBox = useTemplateRef('name-box');
const NAME_MIN_TEXT_SIZE = 11;
const NAME_MAX_TEXT_SIZE = 18;

const nameFontSize = ref(NAME_MAX_TEXT_SIZE);
until(nameBox)
  .toBeTruthy()
  .then(box => {
    setVariableFontSize(
      box,
      nameFontSize,
      NAME_MIN_TEXT_SIZE,
      NAME_MAX_TEXT_SIZE
    );
  });

// const multiLineChecker = useTemplateRef('multi-line-checker');
const isMultiLine = computed(() => {
  // if (!multiLineChecker.value) return;
  // if (!descriptionBox.value) return;
  // if (card.description.includes('\n')) return true;
  // if (card.abilities?.length) return true;
  // const boxRect = descriptionBox.value.getBoundingClientRect();
  // const checkerRect = multiLineChecker.value.getBoundingClientRect();
  // return checkerRect.top > boxRect.top;
  return true;
});

const costStatus = computed(() => {
  if (isDefined(card.manaCost)) {
    if (!isDefined(card.baseManaCost) || card.baseManaCost === card.manaCost)
      return '';

    return card.manaCost < card.baseManaCost ? 'buffed' : 'debuffed';
  } else if (isDefined(card.destinyCost)) {
    if (
      !isDefined(card.baseDestinyCost) ||
      card.baseDestinyCost === card.destinyCost
    )
      return '';

    return card.destinyCost < card.baseDestinyCost ? 'buffed' : 'debuffed';
  }

  return '';
});
const { pointerStyle, angle, onMousemove, onMouseleave, onMouseEnter } =
  useCardTilt(root, {
    maxAngle: maxTiltAngle,
    isEnabled: computed(() => isTiltEnabled && isFoil)
  });

const kindBg = computed(() => {
  return assets[`ui/card/kind-${card.kind.toLowerCase()}`].css;
});

const jobsBgs = computed(() => {
  return card.jobs.map(jobId => assets[`ui/card/job-${jobId}`].css);
});
</script>

<template>
  <div
    class="card-perspective-wrapper"
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
        <div ref="name-box" v-if="showText" class="name">
          <div>
            {{ card.name }}
          </div>
        </div>

        <div class="image">
          <div
            v-if="!isFoil || !card.art.foil.noBackground"
            class="art-bg parallax"
            style="--parallax-strength: -1"
          />
          <FoilGlitter v-if="isFoil && card.art.foil.glitter" />
          <div
            class="art-main parallax"
            style="--parallax-strength-x: -2; --parallax-strength-y: -1"
          />
          <FoilScanlines v-if="isFoil && card.art.foil.scanlines" />
          <FoilBrightShine v-if="isFoil && card.art.foil.brightShine" />

          <div
            v-if="isFoil && card.art.foil.foilLayer"
            class="art-foil parallax"
            style="--parallax-strength: 2"
          />

          <div class="art-frame" />
        </div>

        <div class="top-left">
          <div
            v-if="isDefined(card.manaCost)"
            class="mana-cost parallax"
            :class="costStatus"
            data-label="Mana"
          >
            <div class="dual-text" :data-text="card.manaCost">
              {{ card.manaCost }}
            </div>
          </div>
          <div
            v-if="isDefined(card.destinyCost)"
            class="destiny-cost"
            :class="costStatus"
            data-label="Dest."
          >
            <div class="dual-text" :data-text="card.destinyCost">
              {{ card.destinyCost }}
            </div>
          </div>
        </div>

        <div class="top-right">
          <div
            v-for="(jobBg, index) in jobsBgs"
            :key="index"
            class="job parallax"
            :data-label="getJobById(card.jobs[index])?.shortName"
            :style="{ '--bg': jobBg }"
          />
        </div>

        <div class="rarity" />

        <div class="description-frame">
          <div class="kind" />

          <div v-if="showText" class="attributes">
            {{ uppercaseFirstLetter(card.kind.toLocaleLowerCase()) }}
            <span v-if="isDefined(card.subKind)">
              - {{ uppercaseFirstLetter(card.subKind.toLocaleLowerCase()) }}
            </span>
            <span v-if="isDefined(card.tags)" class="tags">
              {{ card.tags.join('- ') }}
            </span>
          </div>
          <div
            v-if="showText"
            class="description"
            ref="description-box"
            :class="{ 'is-multi-line': isMultiLine }"
          >
            <div ref="description-inner">
              <CardText :text="card.description" />
              <CardText
                v-for="ability in card.abilities"
                :key="ability"
                :text="ability"
              />
            </div>
            <span ref="multi-line-checker" />
          </div>
        </div>

        <div v-if="isDefined(card.atk)" class="stat atk parallax">
          <div v-if="showText" class="dual-text" :data-text="card.atk">
            {{ card.atk }}
          </div>
        </div>
        <div
          v-if="isDefined(card.retaliation)"
          class="stat retaliation parallax"
        >
          <div v-if="showText" class="dual-text" :data-text="card.retaliation">
            {{ card.retaliation }}
          </div>
        </div>
        <div v-if="isDefined(card.hp)" class="stat hp parallax">
          <div v-if="showText" class="dual-text" :data-text="card.hp">
            {{ card.hp }}
          </div>
        </div>
        <div v-if="isDefined(card.durability)" class="stat durability parallax">
          <div v-if="showText" class="dual-text" :data-text="card.durability">
            {{ card.durability }}
          </div>
        </div>

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
  width: calc(var(--card-width) * var(--pixel-scale));
  height: calc(var(--card-height) * var(--pixel-scale));
  display: grid;
  font-family: 'Noto Serif', serif;
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

[data-label] {
  &::after {
    content: attr(data-label);
    position: absolute;
    bottom: calc(-5px * var(--pixel-scale));
    width: 100%;
    font-size: calc(var(--pixel-scale) * 6px);
    color: #fcfcfc;
    text-align: center;
    paint-order: stroke fill;
    font-weight: var(--font-weight-5);
    -webkit-text-stroke: 4px black;
    font-family: 'Lato', sans-serif;
  }
}
.card-front {
  backface-visibility: hidden;
  background: url('@/assets/ui/card/card_front.png');
  background-size: cover;
  color: #fcfcfc;
  font-size: calc(var(--pixel-scale) * 8px);
  padding: 1rem;
  position: relative;
  transform-style: preserve-3d;
  position: relative;

  --glare-mask: url('@/assets/ui/card/card_front.png');
  --foil-mask: url('@/assets/ui/card/masks/default.png');
}

.card.animated:has(.foil) .parallax {
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

.front-content {
  position: absolute;
  transform-style: preserve-3d;
  inset: 0;
  transform: translateZ(150px);
}

.card-back {
  transform: rotateY(0.5turn);
  backface-visibility: hidden;
  background: url('@/assets/ui/card/card_backs/default.png');
  background-size: cover;
  --glare-mask: url('@/assets/ui/card-back.png');
  --foil-mask: url('@/assets/ui/card-back.png');
}

.dual-text {
  color: transparent;
  position: relative;
  --_top-color: var(--top-color, #fcfcfc);
  --_bottom-color: var(--bottom-color, #ffb270);
  &::before,
  &::after {
    position: absolute;
    content: attr(data-text);
    color: transparent;
    inset: 0;
  }
  &:after {
    background: linear-gradient(
      var(--_top-color),
      var(--_top-color) 50%,
      var(--_bottom-color) 50%
    );
    line-height: 1.2;
    background-clip: text;
    background-size: 100% 1lh;
    background-repeat: repeat-y;
    translate: var(--dual-text-offset-x, 0) var(--dual-text-offset-y, 0);
  }
  &:before {
    -webkit-text-stroke: calc(2px * var(--pixel-scale))
      var(--dual-text-stroke, black);
    z-index: -1;
    translate: var(--dual-text-offset-x, 0) var(--dual-text-offset-y, 0);
  }
}

@property --foil-image-shadow-hue {
  syntax: '<number>';
  inherits: true;
  initial-value: 0;
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
  /* width: calc(1px * v-bind('card.art.dimensions.width') * var(--pixel-scale));
        height: calc(1px * v-bind('card.art.dimensions.height') * var(--pixel-scale)); */
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

.name {
  width: calc(152px * var(--pixel-scale));
  text-align: center;
  text-wrap: pretty;
  position: absolute;
  top: calc(6px * var(--pixel-scale));
  left: 50%;
  transform: translateX(-50%);
  font-size: calc(var(--pixel-scale) * 0.5px * v-bind(nameFontSize));
  line-height: 1.1;
  height: calc(17px * var(--pixel-scale));
  overflow: hidden;
  color: black;
  background: url('@/assets/ui/card/name-frame.png');
  background-size: cover;
  display: grid;
  place-content: center;
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

.top-left {
  position: absolute;
  top: calc(2px * var(--pixel-scale));
  left: calc(3px * var(--pixel-scale));
  > * {
    z-index: 0;
    background-size: cover;
    background-position: center;
    display: grid;
    place-content: center;
    font-size: calc(var(--pixel-scale) * 11px);
    position: relative;
    font-weight: var(--font-weight-7);
  }
}

.top-right {
  position: absolute;
  top: calc(2px * var(--pixel-scale));
  right: calc(3px * var(--pixel-scale));
}

.job {
  width: calc(24px * var(--pixel-scale));
  aspect-ratio: 1;
  background: var(--bg);
  background-size: cover;
}

.buffed {
  --top-color: var(--green-2);
  --bottom-color: var(--green-6);
}
.debuffed {
  --top-color: var(--red-3);
  --bottom-color: var(--red-6);
}
.mana-cost {
  background-image: url('@/assets/ui/card/mana-cost.png');
  font-weight: var(--font-weight-7);
  font-size: calc(var(--pixel-scale) * 14px);
  padding-top: calc(3px * var(--pixel-scale));
  width: calc(24px * var(--pixel-scale));
  aspect-ratio: 1;
  .dual-text::before {
    transform: translateY(-3px);
  }
}

.destiny-cost {
  background-image: url('@/assets/ui/card/destiny-cost.png');
  font-weight: var(--font-weight-7);
  padding-top: calc(3px * var(--pixel-scale));
  width: calc(24px * var(--pixel-scale));
  aspect-ratio: 1;
  font-size: calc(var(--pixel-scale) * 14px);
  .dual-text::before {
    transform: translateY(-3px);
  }
}

.job {
  background-image: var(--bg);
}

.stat {
  width: calc(27px * var(--pixel-scale));
  height: calc(25px * var(--pixel-scale));
  background-repeat: no-repeat;
  background-size: cover;
  position: absolute;
  left: calc(2px * var(--pixel-scale));
  font-size: calc(var(--pixel-scale) * 11px);
  text-align: right;
  font-weight: var(--font-weight-7);
  font-family: 'Lato', sans-serif;
  display: grid;
  place-content: center;
  --dual-text-offset-y: 4px;
  --dual-text-offset-x: -2px;
}

.atk {
  background-image: url('@/assets/ui/card/attack.png');
  top: calc(38px * var(--pixel-scale));
}

.hp {
  background-image: url('@/assets/ui/card/health.png');
  top: calc(90px * var(--pixel-scale));
}

.durability {
  background-image: url('@/assets/ui/card/durability.png');
  top: calc(90px * var(--pixel-scale));
}

.retaliation {
  background-image: url('@/assets/ui/card/retaliation.png');
  top: calc(64px * var(--pixel-scale));
}

.kind {
  position: absolute;
  width: calc(16px * var(--pixel-scale));
  aspect-ratio: 1;
  background: v-bind(kindBg);
  background-size: cover;
  top: calc(0.5px * var(--pixel-scale));
  left: calc(1px * var(--pixel-scale));
}

.attributes {
  width: calc(92px * var(--pixel-scale));
  position: absolute;
  top: calc(3px * var(--pixel-scale));
  left: calc(22px * var(--pixel-scale));
  font-size: calc(var(--pixel-scale) * 7px);
  color: black;
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
.description {
  padding: 0 4px;
  width: calc(132px * var(--pixel-scale));
  height: calc(58px * var(--pixel-scale));
  position: absolute;
  top: calc(19px * var(--pixel-scale));
  left: calc(14px * var(--pixel-scale));
  font-size: calc(var(--pixel-scale) * 0.5px * v-bind(descriptionFontSize));
  overflow: hidden;
  text-align: center;
  line-height: 1.2;
  &.is-multi-line {
    text-align: left;
  }
  > * {
    display: inline-block;
  }
  > span {
    width: 1px;
    height: 1px;
    align-self: start;
    vertical-align: top;
  }
}
</style>
