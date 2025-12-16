<script setup lang="ts">
import {
  RARITIES,
  type CardKind,
  type CardSpeed,
  type CardTint,
  type Faction,
  type Rarity,
  type Rune
} from '@game/engine/src/card/card.enums';
import { clamp, isDefined, mapRange, uppercaseFirstLetter } from '@game/shared';
import CardText from '@/card/components/CardText.vue';
import {
  unrefElement,
  until,
  useElementBounding,
  useMouse,
  useResizeObserver
} from '@vueuse/core';
import CardFoil from './CardFoil.vue';
import CardGlare from './CardGlare.vue';
import { match } from 'ts-pattern';

const {
  card,
  isFoil,
  isAnimated = true,
  showText = true
} = defineProps<{
  card: {
    id: string;
    name: string;
    description: string;
    art: {
      dimensions: {
        width: number;
        height: number;
      };
      bg: string;
      main: string;
      breakout?: string;
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
    runes: Rune[];
  };
  isFoil?: boolean;
  isAnimated?: boolean;
  showText?: boolean;
}>();

const rarityBg = computed(() => {
  if (
    [RARITIES.BASIC, RARITIES.COMMON, RARITIES.TOKEN].includes(
      card.rarity as any
    )
  ) {
    return `url('/assets/ui/card/rarity-common.png')`;
  }

  return `url('/assets/ui/card/rarity-${card.rarity}.png')`;
});

const speedBg = computed(() => {
  return `url('/assets/ui/card-speed-badge-${card.speed.toLowerCase()}.png')`;
});

const artFrameImage = computed(() => {
  return `url('${card.art.frame}')`;
});

const artBgImage = computed(() => {
  return `url('${card.art.bg}')`;
});

const artMainImage = computed(() => {
  return `url('${card.art.main}')`;
});

const artBreakoutImage = computed(() => {
  return card.art.breakout ? `url('${card.art.breakout}')` : 'none';
});

const root = useTemplateRef('card');
const { x, y } = useMouse({
  scroll: false
});

const rect = useElementBounding(root);

const pointerStyle = computed(() => {
  const left = rect.left.value ?? 0;
  const top = rect.top.value ?? 0;
  const width = rect.width.value ?? 0;
  const height = rect.height.value ?? 0;

  const pointer = {
    x: clamp(x.value - left, 0, width),
    y: clamp(y.value - top, 0, height)
  };
  const percent = {
    x: (pointer.x / width) * 100,
    y: (pointer.y / height) * 100
  };
  return {
    glareX: pointer.x,
    glareY: pointer.y,
    foilX: mapRange(percent.x, [0, 100], [0, 37.9]),
    foilY: percent.y,
    foilOilX: width - pointer.x,
    foilOilY: height - pointer.y,
    pointerFromCenter: clamp(
      Math.sqrt(
        (percent.y - 50) * (percent.y - 50) +
          (percent.x - 50) * (percent.x - 50)
      ) / 50,
      0,
      1
    )
  };
});

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
const DESCRIPTION_MAX_TEXT_SIZE = 13.5;
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

const angle = ref({
  x: 0,
  y: 0
});

const MAX_ANGLE = 30;
const onMousemove = (e: MouseEvent) => {
  if (!root.value) return;

  const { clientX, clientY } = e;
  const { left, top, width, height } = unrefElement(
    root.value
  )!.getBoundingClientRect();
  angle.value = {
    y: ((clientX - left) / width - 0.5) * MAX_ANGLE,
    x: ((clientY - top) / height - 0.5) * MAX_ANGLE
  };
};

const onMouseleave = () => {
  gsap.to(angle.value, {
    x: 0,
    y: 0,
    duration: 0.5,
    ease: Power2.easeOut
  });
};

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
  return `url('/assets/ui/card/kind-${card.kind.toLowerCase()}.png')`;
});
</script>

<template>
  <div
    class="card-perspective-wrapper"
    @mousemove="onMousemove"
    @mouseleave="onMouseleave"
  >
    <div
      class="card"
      :class="[card.kind.toLocaleLowerCase(), isAnimated && 'animated']"
      :data-flip-id="`card_${card.id}`"
      ref="card"
    >
      <div class="card-front">
        <div class="image">
          <div class="art-bg" />
          <div class="art-main parallax" />
          <div class="art-frame" />
          <div class="art-breakout parallax" />
        </div>

        <div ref="name-box" v-if="showText" class="name">
          <div>
            {{ card.name }}
          </div>
        </div>

        <div class="top-left parallax" style="--parallax-strength: 0.5">
          <div
            v-if="isDefined(card.manaCost)"
            class="mana-cost"
            :class="costStatus"
            data-label="Cost"
          >
            <div class="dual-text" :data-text="card.manaCost">
              {{ card.manaCost }}
            </div>
          </div>
          <div
            v-if="isDefined(card.destinyCost)"
            class="destiny-cost"
            :class="costStatus"
          >
            <div class="dual-text" :data-text="card.destinyCost">
              {{ card.destinyCost }}
            </div>
          </div>
        </div>

        <div
          class="faction parallax"
          :style="{
            '--parallax-strength': 0.5,
            '--bg': `url(/assets/ui/card/faction-${card.faction.id}.png)`
          }"
        />

        <div class="rarity parallax" style="--parallax-strength: 0.35" />

        <div class="description-frame">
          <div class="kind" />
          <div
            v-if="showText"
            class="attributes"
            style="--parallax-strength: 0.35"
          >
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
            style="--parallax-strength: 0.35"
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

        <div v-if="isDefined(card.atk)" class="stat atk">
          <div v-if="showText" class="dual-text" :data-text="card.atk">
            {{ card.atk }}
          </div>
        </div>
        <div v-if="isDefined(card.hp)" class="stat hp">
          <div v-if="showText" class="dual-text" :data-text="card.hp">
            {{ card.hp }}
          </div>
        </div>
        <div v-if="isDefined(card.durability)" class="stat durability">
          <div v-if="showText" class="dual-text" :data-text="card.durability">
            {{ card.durability }}
          </div>
        </div>
        <div v-if="isDefined(card.countdown)" class="stat countdown">
          <div v-if="showText" class="dual-text" :data-text="card.countdown">
            {{ card.countdown }}
          </div>
        </div>

        <div class="runes">
          <div
            v-for="(rune, index) in card.runes"
            :key="index"
            class="rune"
            :style="{
              '--bg': `url('/assets/ui/card/rune-${rune.toLowerCase()}.png')`
            }"
          />
        </div>
        <CardFoil v-if="isFoil" />

        <CardGlare />
      </div>
      <div class="card-back">
        <CardFoil v-if="isFoil" />
        <CardGlare />
      </div>
    </div>
  </div>
</template>

<style scoped lang="postcss">
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
  /* --pointer-from-center: v-bind('pointerStyle?.pointerFromCenter'); */
  width: calc(var(--card-width) * var(--pixel-scale));
  height: calc(var(--card-height) * var(--pixel-scale));
  display: grid;
  font-family: 'Noto Serif', serif;
  transform-style: preserve-3d;
  position: relative;

  --foil-animated-toggle: ;
  .card-perspective-wrapper:hover:has(.foil) &.animated {
    transform: rotateY(calc(1deg * v-bind('angle.y')))
      rotateX(calc(1deg * v-bind('angle.x')));
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
  background: url('/assets/ui/card/card_front.png');
  background-size: cover;
  color: #fcffcb;
  font-size: calc(var(--pixel-scale) * 8px);
  padding: 1rem;
  position: relative;
  transform-style: preserve-3d;
  position: relative;
  filter: drop-shadow(0 2px 2px hsl(0 0% 100% / 0.35));
  --glare-mask: url('/assets/ui/card/card_front.png');
  --foil-mask: url('/assets/ui/card/card_front.png');
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: v-bind(tintGradient);
    mix-blend-mode: v-bind('card.art.tint.blendMode');
    opacity: v-bind('card.art.tint.opacity');
    mask-image: url('/assets/ui/card/tint-mask.png');
    mask-size: cover;
    z-index: -1;
    pointer-events: none;
  }
}

.card.animated:has(.foil) .parallax {
  --parallax-strength: 1;
  --parallax-x: calc(v-bind('angle.y') * var(--parallax-strength) * 1px);
  --parallax-y: calc(v-bind('angle.x') * var(--parallax-strength) * -1px);
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
  background: url('/assets/ui/card-back.png');
  background-size: cover;
  --glare-mask: url('/assets/ui/card-back.png');
  --foil-mask: url('/assets/ui/card-back.png');
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
.art-main {
  position: absolute;
  bottom: 0;
  left: 50%;
  width: calc(1px * v-bind('card.art.dimensions.width') * var(--pixel-scale));
  height: calc(1px * v-bind('card.art.dimensions.height') * var(--pixel-scale));
  translate: -50% 0;
  background: v-bind(artMainImage);
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
}

.image {
  width: calc(var(--card-art-frame-width) * var(--pixel-scale));
  height: calc(var(--card-art-frame-height) * var(--pixel-scale));
  position: absolute;
  top: calc(27px * var(--pixel-scale));
  left: 50%;

  --parallax-offset-x: -50%;
  /* .card.animated:has(.foil) & {
    --parallax-x: calc(v-bind('angle.y') * 0.5px);
    --parallax-y: calc(v-bind('angle.x') * -0.5px);
  } */
  translate: -50% 0;
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
  background: url('/assets/ui/card/name-frame.png');
  background-size: cover;
  display: grid;
  place-content: center;
}

.rarity {
  background: v-bind(rarityBg);
  background-size: cover;
  background-position: center;
  width: calc(12px * var(--pixel-scale));
  height: calc(16px * var(--pixel-scale));
  position: absolute;
  bottom: calc(88px * var(--pixel-scale));
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

.speed {
  background-image: var(--bg);
  background-size: cover;
  width: calc(40px * var(--pixel-scale));
  height: calc(16px * var(--pixel-scale));
  font-size: calc(var(--pixel-scale) * 7px);
  text-align: right;
  padding-right: calc(8px * var(--pixel-scale));

  --dual-text-offset-x: calc(-17px * var(--pixel-scale));
  --dual-text-offset-y: calc(3.5px * var(--pixel-scale));
  + * {
    margin-top: calc(2px * var(--pixel-scale));
  }
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
  background-image: url('/assets/ui/card/mana-cost.png');
  font-weight: var(--font-weight-7);
  font-size: calc(var(--pixel-scale) * 14px);
  padding-top: calc(3px * var(--pixel-scale));
  .dual-text::before {
    transform: translateY(-3px);
  }
}

.destiny-cost {
  background-image: url('/assets/ui/card/destiny-cost.png');
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
  display: grid;
  place-content: center;
  font-weight: var(--font-weight-7);
  font-size: calc(var(--pixel-scale) * 11px);
  --dual-text-offset-y: 2px;
}

.atk {
  background-image: url('/assets/ui/card/attack.png');
  bottom: calc(2px * var(--pixel-scale));
  left: calc(3px * var(--pixel-scale));
  padding-right: calc(2px * var(--pixel-scale));
}

.hp {
  background-image: url('/assets/ui/card/health.png');
  bottom: calc(2px * var(--pixel-scale));
  right: calc(3px * var(--pixel-scale));
  padding-left: calc(2px * var(--pixel-scale));
}

.durability {
  background-image: url('/assets/ui/card/durability.png');
  bottom: calc(2px * var(--pixel-scale));
  right: calc(3px * var(--pixel-scale));
  padding-left: calc(2px * var(--pixel-scale));
}

.countdown {
  background-image: url('/assets/ui/card/countdown.png');
  bottom: calc(2px * var(--pixel-scale));
  right: calc(3px * var(--pixel-scale));
  padding-left: calc(2px * var(--pixel-scale));
}

.kind {
  position: absolute;
  inset: 0;
  width: calc(16px * var(--pixel-scale));
  aspect-ratio: 1;
  background: v-bind(kindBg);
  background-size: cover;
  top: calc(0.5px * var(--pixel-scale));
  left: calc(3px * var(--pixel-scale));
}

.attributes {
  width: calc(92px * var(--pixel-scale));
  position: absolute;
  top: calc(5px * var(--pixel-scale));
  left: calc(25px * var(--pixel-scale));
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
  background: url('/assets/ui/card/description-frame.png');
  background-size: cover;
}
.description {
  width: calc(144px * var(--pixel-scale));
  height: calc(48px * var(--pixel-scale));
  position: absolute;
  top: calc(18px * var(--pixel-scale));
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

.runes {
  position: absolute;
  bottom: calc(4px * var(--pixel-scale));
  left: 50%;
  translate: -50% 0;
  display: flex;
  gap: calc(3px * var(--pixel-scale));
}

.rune {
  width: calc(17px * var(--pixel-scale));
  height: calc(18px * var(--pixel-scale));
  background: var(--bg);
  background-size: cover;
}
</style>
