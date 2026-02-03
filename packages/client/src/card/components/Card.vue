<script setup lang="ts">
import {
  RARITIES,
  type CardKind,
  type CardSpeed,
  type CardTint,
  type Faction,
  type Rarity
} from '@game/engine/src/card/card.enums';
import { isDefined, uppercaseFirstLetter } from '@game/shared';
import CardText from '@/card/components/CardText.vue';
import { until, useResizeObserver } from '@vueuse/core';
import CardGlare from './CardGlare.vue';
import { match } from 'ts-pattern';
import { useCardTilt } from '../composables/useCardtilt';
import FoilSheen from './foil/FoilSheen.vue';
import FoilOil from './foil/FoilOil.vue';
import FoilGradient from './foil/FoilGradient.vue';
import FoilScanlines from './foil/FoilScanlines.vue';
import FoilLightGradient from './foil/FoilLightGradient.vue';
import FoilGoldenGlare from './foil/FoilGoldenGlare.vue';
import FoilGlitter from './foil/FoilGlitter.vue';
import { assets } from '@/assets';

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
    art: {
      foil: {
        sheen?: boolean;
        oil?: boolean;
        gradient?: boolean;
        lightGradient?: boolean;
        scanlines?: boolean;
        goldenGlare?: boolean;
        glitter?: boolean;
        foilLayer?: boolean;
        noBackground?: boolean;
        noFrame?: boolean;
      };
      dimensions: {
        width: number;
        height: number;
      };
      bg: string;
      main: string;
      breakout?: string;
      foilArt?: string;
      frame: string;
      tint: CardTint;
    };
    kind: CardKind;
    manaCost?: number | null;
    baseManaCost?: number | null;
    destinyCost?: number | null;
    baseDestinyCost?: number | null;
    rarity: Rarity;
    level?: number | null;
    atk?: number | null;
    hp?: number | null;
    countdown?: number | null;
    spellpower?: number | null;
    durability?: number | null;
    abilities?: string[];
    subKind?: string | null;
    speed: CardSpeed;
    tags?: string[];
    faction: Faction;
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

const speedBg = computed(() => {
  return assets[`ui/card/speed-${card.speed.toLowerCase()}`].css;
});

const artFrameImage = computed(() => {
  return assets[card.art.frame].css;
});

const artBgImage = computed(() => {
  return assets[card.art.bg].css;
});

const artMainImage = computed(() => {
  return assets[card.art.main].css;
});

const artFoilImage = computed(() => {
  if (!card.art.foilArt) return 'transparent';
  return assets[card.art.foilArt].css;
});

const artBreakoutImage = computed(() => {
  return card.art.breakout ? assets[card.art.breakout].css : 'none';
});

const root = useTemplateRef('card');

const setVariableFontSize = (
  box: HTMLElement,
  sizeRef: Ref<number>,
  min: number
) => {
  const inner = box.firstChild as HTMLElement;
  const outerHeight = box.clientHeight;

  let innerHeight = inner.clientHeight;

  while (innerHeight > outerHeight) {
    sizeRef.value -= 0.5;
    box.style.fontSize = `${sizeRef.value}px`;

    innerHeight = inner.clientHeight;

    if (sizeRef.value <= min) {
      box.style.fontSize = '';
      break;
    }
  }
};
const descriptionBox = useTemplateRef('description-box');
const descriptionChild = computed(() => {
  if (!descriptionBox.value) return;
  return descriptionBox.value.firstChild as HTMLElement;
});
// we need a resize observer because the description box size change change when description icons are loaded for the first time
useResizeObserver(descriptionChild, () => {
  setVariableFontSize(
    descriptionBox.value!,
    descriptionFontSize,
    DESCRIPTION_MIN_TEXT_SIZE
  );
});
const DESCRIPTION_MIN_TEXT_SIZE = 9;
const DESCRIPTION_MAX_TEXT_SIZE = 15;
const descriptionFontSize = ref(DESCRIPTION_MAX_TEXT_SIZE);
until(descriptionBox)
  .toBeTruthy()
  .then(box => {
    setVariableFontSize(box, descriptionFontSize, DESCRIPTION_MIN_TEXT_SIZE);
  });

const nameBox = useTemplateRef('name-box');
const NAME_MIN_TEXT_SIZE = 11;
const NAME_MAX_TEXT_SIZE = 18;

const nameFontSize = ref(NAME_MAX_TEXT_SIZE);
until(nameBox)
  .toBeTruthy()
  .then(box => {
    setVariableFontSize(box, nameFontSize, NAME_MIN_TEXT_SIZE);
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

const tintGradient = computed(() => {
  return match(card.art.tint)
    .with({ mode: { type: 'linear' } }, tint => {
      return `linear-gradient(${tint.mode.angle}deg, ${tint.colors.join(
        ', '
      )})`;
    })
    .with({ mode: { type: 'radial' } }, tint => {
      return `radial-gradient(circle at center, ${tint.colors.join(', ')})`;
    })
    .exhaustive();
});

const kindBg = computed(() => {
  return assets[`ui/card/kind-${card.kind.toLowerCase()}`].css;
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
          <div v-if="!isFoil || !card.art.foil.noBackground" class="art-bg" />
          <FoilScanlines v-if="isFoil && card.art.foil.scanlines" />
          <FoilGlitter v-if="isFoil && card.art.foil.glitter" />
          <div class="art-main parallax" style="--parallax-strength: 2" />
          <div
            v-if="!isFoil || !card.art.foil.noFrame"
            class="art-frame parallax"
            style="--parallax-strength: 0.5"
          />
          <div
            v-if="isFoil && card.art.breakout"
            class="art-breakout parallax"
            style="--parallax-strength: 2"
          />
          <div
            v-if="isFoil && card.art.foil.foilLayer"
            class="art-foil parallax"
            style="--parallax-strength: 2"
          />
        </div>

        <div class="top-left parallax">
          <div
            v-if="isDefined(card.manaCost)"
            class="mana-cost"
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

        <div
          class="faction parallax"
          :style="{
            '--bg':
              assets[`ui/card/faction-${card.faction.id.toLocaleLowerCase()}`]
                .css
          }"
          :data-label="card.faction.shortName"
        />

        <div class="rarity parallax" style="--parallax-strength: 0.5" />

        <div class="description-frame">
          <div class="kind" />
          <div class="speed">
            {{ uppercaseFirstLetter(card.speed.toLocaleLowerCase()) }}
          </div>
          <div v-if="showText" class="attributes">
            {{ uppercaseFirstLetter(card.kind.toLocaleLowerCase()) }}
            <span v-if="isDefined(card.level)">- Lvl{{ card.level }}</span>
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
            <div>
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
          <div v-if="showText">
            {{ card.atk }}
          </div>
        </div>
        <div v-if="isDefined(card.hp)" class="stat hp parallax">
          <div v-if="showText">
            {{ card.hp }}
          </div>
        </div>
        <div v-if="isDefined(card.durability)" class="stat durability parallax">
          <div v-if="showText">
            {{ card.durability }}
          </div>
        </div>
        <div v-if="isDefined(card.countdown)" class="stat countdown parallax">
          <div v-if="showText">
            {{ card.countdown }}
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
  filter: drop-shadow(0 2px 0 hsl(0 0% 100% / 0.2))
    drop-shadow(0 -2px 0 hsl(0 0% 100% / 0.2))
    drop-shadow(-2px 0 0 hsl(0 0% 100% / 0.2))
    drop-shadow(2px 0 0 hsl(0 0% 100% / 0.2));
  --glare-mask: url('@/assets/ui/card/card_front.png');
  --foil-mask: url('@/assets/ui/card/card_front.png');
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: v-bind(tintGradient);
    mix-blend-mode: v-bind('card.art.tint.blendMode');
    opacity: v-bind('card.art.tint.opacity');
    mask-image: url('@/assets/ui/card/tint-mask.png');
    mask-size: cover;
    z-index: -1;
    pointer-events: none;
  }
}

.card.animated:has(.foil) .parallax {
  --parallax-strength: 1;
  --_parallax-strength: calc(var(--parallax-strength) * var(--pixel-scale) / 2);
  --parallax-x: calc(v-bind('angle.y') * var(--_parallax-strength) * 1px);
  --parallax-y: calc(v-bind('angle.x') * var(--_parallax-strength) * -1px);
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
  background: v-bind(artFrameImage);
  background-size: cover;
}

@keyframes foil-art-glow {
  to {
    opacity: 0;
  }
}
.art-main {
  position: absolute;
  bottom: 0;
  left: 50%;
  width: calc(1px * v-bind('card.art.dimensions.width') * var(--pixel-scale));
  height: calc(1px * v-bind('card.art.dimensions.height') * var(--pixel-scale));
  translate: -50% 0;
  background: v-bind(artMainImage);
  background-size: cover;
  overflow: hidden;
  --parallax-offset-x: -50%;
  .card:has(.foil) &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: v-bind(artMainImage);
    background-size: cover;
    filter: blur(calc(12px * var(--pixel-scale))) brightness(1.1);
    z-index: -1;
    transform: scale(1.05);
    mix-blend-mode: plus-lighter;
    opacity: 0.35;
    animation: foil-art-glow 5s linear alternate infinite;
  }
}
.art-foil {
  position: absolute;
  bottom: 0;
  left: 50%;
  width: calc(1px * v-bind('card.art.dimensions.width') * var(--pixel-scale));
  height: calc(1px * v-bind('card.art.dimensions.height') * var(--pixel-scale));
  translate: -50% 0;
  background: v-bind(artFoilImage);
  background-size: cover;
  --parallax-offset-x: -50%;
}
.art-breakout {
  position: absolute;
  bottom: 0;
  left: 50%;
  width: calc(1px * v-bind('card.art.dimensions.width') * var(--pixel-scale));
  height: calc(1px * v-bind('card.art.dimensions.height') * var(--pixel-scale));
  translate: -50% 0;
  background: v-bind(artBreakoutImage);
  background-size: cover;
  --parallax-offset-x: -50%;
}
.art-bg {
  position: absolute;
  bottom: 0;
  left: 50%;
  width: calc(1px * v-bind('card.art.dimensions.width') * var(--pixel-scale));
  height: calc(1px * v-bind('card.art.dimensions.height') * var(--pixel-scale));
  translate: -50% 0;
  background: v-bind(artBgImage);
  background-size: cover;
  --parallax-offset-x: -50%;
}

.image {
  pointer-events: none;
  width: calc(var(--card-art-frame-width) * var(--pixel-scale));
  height: calc(var(--card-art-frame-height) * var(--pixel-scale));
  position: absolute;
  top: calc(27px * var(--pixel-scale));
  left: 50%;
  translate: -50% 0;

  .foil {
    --foil-mask: v-bind(artBgImage);
    position: absolute;
    bottom: 0;
    left: 50%;
    width: calc(1px * v-bind('card.art.dimensions.width') * var(--pixel-scale));
    height: calc(
      1px * v-bind('card.art.dimensions.height') * var(--pixel-scale)
    );
    translate: -50% 0;
    --parallax-offset-x: -50%;
  }
}

.name {
  width: calc(154px * var(--pixel-scale));
  text-align: center;
  text-wrap: pretty;
  position: absolute;
  top: calc(11px * var(--pixel-scale));
  left: 50%;
  transform: translateX(-50%);
  font-size: calc(var(--pixel-scale) * 0.5px * v-bind(nameFontSize));
  line-height: 1.1;
  height: calc(16px * var(--pixel-scale));
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
  left: 50%;
  transform: translateX(-50%);
}

.top-left {
  position: absolute;
  top: calc(7px * var(--pixel-scale));
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

.faction {
  position: absolute;
  top: calc(7px * var(--pixel-scale));
  right: calc(3px * var(--pixel-scale));
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
  width: calc(31px * var(--pixel-scale));
  height: calc(16px * var(--pixel-scale));
  background-repeat: no-repeat;
  background-size: cover;
  position: absolute;
  bottom: calc(3px * var(--pixel-scale));
  font-size: calc(var(--pixel-scale) * 8px);
  text-align: right;
  padding-top: calc(2.5px * var(--pixel-scale));
  padding-right: calc(17px * var(--pixel-scale));
  font-weight: var(--font-weight-7);
  font-family: 'Lato', sans-serif;
  --dual-text-offset-y: 2px;
}

.atk {
  background-image: url('@/assets/ui/card/attack-small.png');
  right: calc(36px * var(--pixel-scale));
}

.hp {
  background-image: url('@/assets/ui/card/health-small.png');
  right: calc(3px * var(--pixel-scale));
  padding-left: calc(2px * var(--pixel-scale));
}

.durability {
  background-image: url('@/assets/ui/card/durability-small.png');
  right: calc(3px * var(--pixel-scale));
  padding-left: calc(2px * var(--pixel-scale));
}

.countdown {
  background-image: url('@/assets/ui/card/countdown-small.png');
  right: calc(3px * var(--pixel-scale));
  padding-left: calc(2px * var(--pixel-scale));
}

.kind {
  position: absolute;
  width: calc(16px * var(--pixel-scale));
  aspect-ratio: 1;
  background: v-bind(kindBg);
  background-size: cover;
  top: calc(0.5px * var(--pixel-scale));
  left: calc(3px * var(--pixel-scale));
}

.speed {
  background: v-bind(speedBg);
  background-size: cover;
  position: absolute;
  top: calc(0.5px * var(--pixel-scale));
  right: calc(3px * var(--pixel-scale));
  width: calc(40px * var(--pixel-scale));
  height: calc(16px * var(--pixel-scale));
  font-size: calc(var(--pixel-scale) * 7px);
  text-align: right;
  padding-top: calc(2.5px * var(--pixel-scale));
  padding-right: calc(17px * var(--pixel-scale));
  font-family: 'Lato', sans-serif;
  + * {
    margin-top: calc(2px * var(--pixel-scale));
  }
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
  width: calc(160px * var(--pixel-scale));
  height: calc(72px * var(--pixel-scale));
  position: absolute;
  bottom: calc(11px * var(--pixel-scale));
  left: 50%;
  translate: -50% 0;
  background: url('@/assets/ui/card/description-frame.png');
  background-size: cover;
}
.description {
  padding: 0 4px;
  width: calc(144px * var(--pixel-scale));
  height: calc(46px * var(--pixel-scale));
  position: absolute;
  top: calc(19px * var(--pixel-scale));
  left: calc(8px * var(--pixel-scale));
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
